<?php

namespace App\Services;

use App\Data\DashboardFilters;
use App\Enums\ReferralStatus;
use App\Models\CaseFile;
use App\Models\GbvCase;
use App\Models\Partner;
use App\Models\Referral;
use App\Models\Survivor;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    /* ================================================================== */
    /*  Scopes                                                             */
    /* ================================================================== */

    private function periodStart(string $period): ?CarbonImmutable
    {
        return match ($period) {
            '7d' => CarbonImmutable::now()->subDays(7)->startOfDay(),
            '30d' => CarbonImmutable::now()->subDays(30)->startOfDay(),
            '90d' => CarbonImmutable::now()->subDays(90)->startOfDay(),
            default => null,
        };
    }

    private function applyPeriod(Builder $q, DashboardFilters $f, string $column = 'created_at'): Builder
    {
        if ($start = $this->periodStart($f->period)) {
            $q->where($column, '>=', $start);
        }
        if ($f->dateFrom) {
            $q->whereDate($column, '>=', $f->dateFrom);
        }
        if ($f->dateTo) {
            $q->whereDate($column, '<=', $f->dateTo);
        }
        return $q;
    }

    private function applyPartner(Builder $q, DashboardFilters $f, string $column = 'partner_id'): Builder
    {
        return $f->partnerId ? $q->where($column, $f->partnerId) : $q;
    }

    /**
     * Survivor-level filters (location, gender, age, disability).
     * Works on either the survivors table or a whereHas('survivor') subquery.
     */
    private function applySurvivorFilters(Builder $q, DashboardFilters $f, string $table = 'survivors'): Builder
    {
        if ($f->countyId) {
            $q->where("{$table}.county_id", $f->countyId);
        }
        if ($f->subCountyId) {
            $q->where("{$table}.sub_county_id", $f->subCountyId);
        }
        if ($f->wardId) {
            $q->where("{$table}.ward_id", $f->wardId);
        }
        if ($f->villageId) {
            $q->where("{$table}.village_id", $f->villageId);
        }
        if ($f->genderId) {
            $q->where("{$table}.gender_option_id", $f->genderId);
        }
        if ($f->ageRangeId) {
            $q->where("{$table}.age_range_id", $f->ageRangeId);
        }
        if ($f->disabilityTypeId) {
            $q->whereExists(fn($sub) => $sub
                ->select(DB::raw(1))
                ->from('survivor_disability')
                ->whereColumn('survivor_disability.survivor_id', "{$table}.id")
                ->where('survivor_disability.disability_type_id', $f->disabilityTypeId));
        }
        return $q;
    }

    /** Survivor base query, actor-scoped + all filters applied. */
    private function survivorBase(User $actor, DashboardFilters $f): Builder
    {
        $q = Survivor::query()->visibleTo($actor);
        $this->applySurvivorFilters($q, $f, 'survivors');
        $this->applyPartner($q, $f, 'survivors.partner_id');
        $this->applyPeriod($q, $f, 'survivors.created_at');
        return $q;
    }

    /** GbvCase base query, actor-scoped + all filters applied. */
    private function caseBase(User $actor, DashboardFilters $f): Builder
    {
        $q = GbvCase::query()->visibleTo($actor);

        // Survivor-owned filters → subquery on the survivor relation.
        if (
            $f->countyId || $f->subCountyId || $f->wardId || $f->villageId ||
            $f->genderId || $f->ageRangeId || $f->disabilityTypeId
        ) {
            $q->whereHas('survivor', function (Builder $sub) use ($f) {
                $this->applySurvivorFilters($sub, $f, 'survivors');
            });
        }

        if ($f->incidentTypeId) {
            $q->where('gbv_cases.incident_type_id', $f->incidentTypeId);
        }

        $this->applyPartner($q, $f, 'gbv_cases.partner_id');
        $this->applyPeriod($q, $f, 'gbv_cases.created_at');

        return $q;
    }

    /* ================================================================== */
    /*  Public metrics                                                     */
    /* ================================================================== */

    public function summary(User $actor, DashboardFilters $f): array
    {
        $survivors = $this->survivorBase($actor, $f);
        $cases = $this->caseBase($actor, $f);

        $files = CaseFile::query()
            ->whereIn('gbv_case_id', (clone $cases)->select('gbv_cases.id'));

        $referrals = Referral::query()
            ->when(!$actor->isSuperAdmin(), function ($q) use ($actor) {
                if ($actor->partner_id) {
                    $q->where(function ($q) use ($actor) {
                        $q->where('from_partner_id', $actor->partner_id)
                            ->orWhere('to_partner_id', $actor->partner_id);
                    });
                }
            })
            ->when($f->partnerId, fn($q) => $q->where(function ($q) use ($f) {
                $q->where('from_partner_id', $f->partnerId)
                    ->orWhere('to_partner_id', $f->partnerId);
            }));

        return [
            'survivors_total' => (clone $survivors)->count(),
            'survivors_new_30d' => (clone $survivors)
                ->where('survivors.created_at', '>=', now()->subDays(30))->count(),
            'survivors_anonymous' => (clone $survivors)->where('survivors.anonymous', true)->count(),

            'cases_total' => (clone $cases)->count(),
            'cases_open' => (clone $cases)
                ->whereHas('status', fn($q) => $q->where('is_concluded', false))->count(),
            'cases_concluded' => (clone $cases)
                ->whereHas('status', fn($q) => $q->where('is_concluded', true))->count(),
            'cases_new_30d' => (clone $cases)
                ->where('gbv_cases.created_at', '>=', now()->subDays(30))->count(),
            'cases_sensitive' => (clone $cases)->where('gbv_cases.is_sensitive', true)->count(),

            'files_total' => (clone $files)->count(),
            'files_pending_review' => (clone $files)
                ->whereHas('fileType', fn($q) => $q->where('requires_review', true))->count(),

            'referrals_total' => (clone $referrals)->count(),
            'referrals_open' => (clone $referrals)->open()->count(),
            'referrals_completed' => (clone $referrals)
                ->where('status', ReferralStatus::Completed->value)->count(),
            'referrals_pending' => (clone $referrals)
                ->where('status', ReferralStatus::Pending->value)->count(),
        ];
    }

    public function survivorsByGender(User $actor, DashboardFilters $f): array
    {
        return $this->survivorBase($actor, $f)
            ->select('survivors.gender_option_id', DB::raw('COUNT(*) as total'))
            ->with('genderOption:id,name')
            ->groupBy('survivors.gender_option_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'name' => $row->genderOption?->name ?? 'Unknown',
                'value' => (int) $row->total,
            ])
            ->all();
    }

    public function survivorsByAgeRange(User $actor, DashboardFilters $f): array
    {
        return $this->survivorBase($actor, $f)
            ->select('survivors.age_range_id', DB::raw('COUNT(*) as total'))
            ->with('ageRange:id,name')
            ->groupBy('survivors.age_range_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'name' => $row->ageRange?->name ?? 'Unknown',
                'value' => (int) $row->total,
            ])
            ->all();
    }

    public function topIncidentTypes(User $actor, int $limit, DashboardFilters $f): array
    {
        return $this->caseBase($actor, $f)
            ->select('gbv_cases.incident_type_id', DB::raw('COUNT(*) as total'))
            ->with('incidentType:id,name')
            ->groupBy('gbv_cases.incident_type_id')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'name' => $row->incidentType?->name ?? 'Unknown',
                'value' => (int) $row->total,
            ])
            ->all();
    }

    public function casesByStatus(User $actor, DashboardFilters $f): array
    {
        return $this->caseBase($actor, $f)
            ->select('gbv_cases.case_status_id', DB::raw('COUNT(*) as total'))
            ->with('status:id,name,color')
            ->groupBy('gbv_cases.case_status_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'name' => $row->status?->name ?? 'Unknown',
                'value' => (int) $row->total,
                'color' => $row->status?->color,
            ])
            ->all();
    }

    /**
     * 12-month trend. Period/date filters are intentionally ignored here
     * (the chart is always 12 months); everything else is honoured.
     */
    public function monthlyTrend(User $actor, DashboardFilters $f): array
    {
        $start = now()->subMonths(11)->startOfMonth();

        $fTrend = new DashboardFilters(
            period: 'all',
            partnerId: $f->partnerId,
            countyId: $f->countyId,
            subCountyId: $f->subCountyId,
            wardId: $f->wardId,
            villageId: $f->villageId,
            genderId: $f->genderId,
            ageRangeId: $f->ageRangeId,
            disabilityTypeId: $f->disabilityTypeId,
            incidentTypeId: $f->incidentTypeId,
            dateFrom: null,
            dateTo: null,
        );

        $survivors = $this->survivorBase($actor, $fTrend)
            ->where('survivors.created_at', '>=', $start)
            ->select(
                DB::raw("DATE_FORMAT(survivors.created_at, '%Y-%m') as ym"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('ym')
            ->pluck('total', 'ym');

        $cases = $this->caseBase($actor, $fTrend)
            ->where('gbv_cases.created_at', '>=', $start)
            ->select(
                DB::raw("DATE_FORMAT(gbv_cases.created_at, '%Y-%m') as ym"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('ym')
            ->pluck('total', 'ym');

        $out = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $out[] = [
                'month' => $date->format('M Y'),
                'survivors' => (int) ($survivors[$key] ?? 0),
                'cases' => (int) ($cases[$key] ?? 0),
            ];
        }
        return $out;
    }

    public function recentCases(User $actor, int $limit, DashboardFilters $f): array
    {
        return $this->caseBase($actor, $f)
            ->with([
                'survivor:id,full_name,anonymous',
                'incidentType:id,name',
                'status:id,name,color',
            ])
            ->latest('gbv_cases.created_at')
            ->limit($limit)
            ->get()
            ->map(fn(GbvCase $case) => [
                'id' => $case->id,
                'case_number' => $case->case_number,
                'survivor_name' => $case->survivor?->anonymous
                    ? 'Anonymous'
                    : ($case->survivor?->full_name ?? '—'),
                'incident_type' => $case->incidentType?->name,
                'status' => $case->status?->name,
                'status_color' => $case->status?->color,
                'created_at' => $case->created_at?->toIso8601String(),
            ])
            ->all();
    }

    public function systemSummary(): array
    {
        return [
            'users_total' => User::count(),
            'users_active' => User::where('is_active', true)->count(),
            'users_new_30d' => User::where('created_at', '>=', now()->subDays(30))->count(),
            'partners_total' => Partner::count(),
            'partners_verified' => Partner::whereNotNull('verified_at')->count(),
            'partners_pending' => Partner::whereNull('verified_at')->count(),
        ];
    }

    public function partnersByType(): array
    {
        return Partner::query()
            ->select('partners.organization_type_id', DB::raw('COUNT(*) as total'))
            ->with('organizationType:id,name')
            ->groupBy('partners.organization_type_id')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'name' => $row->organizationType?->name ?? 'Unknown',
                'value' => (int) $row->total,
            ])
            ->all();
    }

    public function topPartnersByCases(User $actor, int $limit, DashboardFilters $f): array
    {
        return $this->caseBase($actor, $f)
            ->select('gbv_cases.partner_id', DB::raw('COUNT(*) as total'))
            ->with('partner:id,organization_name')
            ->whereNotNull('gbv_cases.partner_id')
            ->groupBy('gbv_cases.partner_id')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'name' => $row->partner?->organization_name ?? 'Unknown',
                'value' => (int) $row->total,
            ])
            ->all();
    }

    public function usersByRoleInPartner(Partner $partner): array
    {
        return User::query()
            ->where('partner_id', $partner->id)
            ->with('roles:id,name')
            ->get()
            ->flatMap(fn(User $u) => $u->roles->pluck('name'))
            ->countBy()
            ->map(fn($count, $name) => ['name' => $name, 'value' => $count])
            ->values()
            ->all();
    }

    public function pendingReferralsForPartner(Partner $partner, int $limit = 5): array
    {
        return Referral::query()
            ->where(function ($q) use ($partner) {
                $q->where('from_partner_id', $partner->id)
                    ->orWhere('to_partner_id', $partner->id);
            })
            ->where('status', ReferralStatus::Pending->value)
            ->with([
                'referralType:id,name',
                'urgency:id,name,color',
                'fromPartner:id,organization_name',
                'toPartner:id,organization_name',
            ])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn(Referral $r) => [
                'id' => $r->id,
                'referral_number' => $r->referral_number,
                'type' => $r->referralType?->name,
                'urgency' => $r->urgency?->name,
                'urgency_color' => $r->urgency?->color,
                'from_partner' => $r->fromPartner?->organization_name,
                'to_partner' => $r->toPartner?->organization_name,
                'created_at' => $r->created_at?->toIso8601String(),
            ])
            ->all();
    }
}