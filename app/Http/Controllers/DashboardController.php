<?php

namespace App\Http\Controllers;

use App\Data\DashboardFilters;
use App\Models\AgeRange;
use App\Models\County;
use App\Models\DisabilityType;
use App\Models\GenderOption;
use App\Models\IncidentType;
use App\Models\Partner;
use App\Models\User;
use App\Services\DashboardMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private DashboardMetricsService $metrics)
    {
    }

    public function __invoke(Request $request): Response
    {
        /** @var User $actor */
        $actor = $request->user();

        $filters = DashboardFilters::fromRequest($request);

        // Non-super-admins are pinned to their own partner, regardless of the query string.
        if (!$actor->isSuperAdmin()) {
            $filters = new DashboardFilters(
                period: $filters->period,
                partnerId: $actor->partner_id,
                countyId: $filters->countyId,
                subCountyId: $filters->subCountyId,
                wardId: $filters->wardId,
                villageId: $filters->villageId,
                genderId: $filters->genderId,
                ageRangeId: $filters->ageRangeId,
                disabilityTypeId: $filters->disabilityTypeId,
                incidentTypeId: $filters->incidentTypeId,
                dateFrom: $filters->dateFrom,
                dateTo: $filters->dateTo,
            );
        }

        if ($actor->hasRole('Super Admin') || $actor->isSuperAdmin()) {
            return $this->superAdmin($actor, $filters);
        }
        if ($actor->hasRole('Admin')) {
            return $this->admin($actor, $filters);
        }
        return $this->partner($actor, $filters);
    }

    private function basePayload(User $actor, DashboardFilters $f): array
    {
        return [
            'summary' => $this->metrics->summary($actor, $f),
            'monthlyTrend' => $this->metrics->monthlyTrend($actor, $f),
            'survivorsByGender' => $this->metrics->survivorsByGender($actor, $f),
            'survivorsByAge' => $this->metrics->survivorsByAgeRange($actor, $f),
            'topIncidentTypes' => $this->metrics->topIncidentTypes($actor, 5, $f),
            'casesByStatus' => $this->metrics->casesByStatus($actor, $f),
            'recentCases' => $this->metrics->recentCases($actor, 5, $f),
            'filters' => $f->toState(),
            'counties' => $this->countyTree(),
            'genders' => $this->options(GenderOption::class),
            'ageRanges' => $this->options(AgeRange::class),
            'disabilityTypes' => $this->options(DisabilityType::class),
            'incidentTypes' => $this->options(IncidentType::class),
            'partners' => $this->partnerOptions($actor),
        ];
    }

    private function superAdmin(User $actor, DashboardFilters $f): Response
    {
        return Inertia::render('dashboard/super-admin', [
            ...$this->basePayload($actor, $f),
            'system' => $this->metrics->systemSummary(),
            'partnersByType' => $this->metrics->partnersByType(),
            'topPartners' => $this->metrics->topPartnersByCases($actor, 5, $f),
        ]);
    }

    private function admin(User $actor, DashboardFilters $f): Response
    {
        $partner = $actor->partner;

        return Inertia::render('dashboard/admin', [
            ...$this->basePayload($actor, $f),
            'usersByRole' => $partner ? $this->metrics->usersByRoleInPartner($partner) : [],
            'pendingReferrals' => $partner ? $this->metrics->pendingReferralsForPartner($partner) : [],
        ]);
    }

    private function partner(User $actor, DashboardFilters $f): Response
    {
        return Inertia::render('dashboard/partner', [
            ...$this->basePayload($actor, $f),
        ]);
    }

    /** @return array<int,array{value:string,label:string}> */
    private function options(string $model): array
    {
        return $model::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($m) => ['value' => (string) $m->id, 'label' => $m->name])
            ->all();
    }

    /** Super admins get the full partner picker, others get a single one. */
    private function partnerOptions(User $actor): array
    {
        $query = $actor->isSuperAdmin()
            ? Partner::query()
            : Partner::where('id', $actor->partner_id);

        return $query
            ->orderBy('organization_name')
            ->get(['id', 'organization_name'])
            ->map(fn($p) => [
                'value' => (string) $p->id,
                'label' => $p->organization_name,
            ])
            ->all();
    }

    private function countyTree(): array
    {
        return County::query()
            ->with(['subCounties.wards.villages'])
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'value' => (string) $c->id,
                'label' => $c->name,
                'sub_counties' => $c->subCounties->map(fn($s) => [
                    'value' => (string) $s->id,
                    'label' => $s->name,
                    'wards' => $s->wards->map(fn($w) => [
                        'value' => (string) $w->id,
                        'label' => $w->name,
                        'villages' => $w->villages->map(fn($v) => [
                            'value' => (string) $v->id,
                            'label' => $v->name,
                        ])->all(),
                    ])->all(),
                ])->all(),
            ])
            ->all();
    }
}