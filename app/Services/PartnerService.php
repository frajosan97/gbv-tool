<?php

namespace App\Services;

use App\Data\PartnerFilters;
use App\Http\Resources\PartnerResource;
use App\Models\Partner;
use App\Models\User;
use App\Support\ReportContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PartnerService
{
    public const ALLOWED_SORTS = [
        'organization_name',
        'status',
        'year_established',
        'created_at',
    ];

    public const MAX_EXPORT_ROWS = 5000;

    private const PDF_VIEW = 'reports.partners-pdf';
    private const PARTNER_PRINT_VIEW = 'reports.partner-print';

    private const PRINT_USERS_LIMIT = 50;
    private const PRINT_SURVIVORS_LIMIT = 50;
    private const PRINT_CASES_LIMIT = 50;
    private const PRINT_REFERRALS_LIMIT = 30;

    // ------------------------------------------------------------------
    //  QUERIES
    // ------------------------------------------------------------------

    public function paginate(PartnerFilters $filters, User $actor): LengthAwarePaginator
    {
        return $this->buildQuery($filters, $actor)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn(Partner $p) => (new PartnerResource($p))->resolve());
    }

    public function exportQuery(PartnerFilters $filters, User $actor): Builder
    {
        return $this->buildQuery($filters, $actor)->limit(self::MAX_EXPORT_ROWS);
    }

    public function exportCollection(PartnerFilters $filters, User $actor): Collection
    {
        return $this->exportQuery($filters, $actor)->get();
    }

    public function findForShow(Partner $partner): Partner
    {
        return $partner->load([
            'organizationType:id,name',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',

            'users' => fn($q) => $q->orderBy('name'),
            'survivors' => fn($q) => $q->orderByDesc('created_at'),
            'gbvCases' => fn($q) => $q->orderByDesc('created_at'),
        ])->loadCount([
                    'users',
                    'survivors',
                    'gbvCases',
                    'gbvCases as active_cases_count' => fn($q) => $q->whereIn('status', [
                        'open',
                        'in_progress',
                        'pending',
                    ]),
                ]);
    }

    public function findForPrint(Partner $partner): Partner
    {
        return $partner->load([
            'organizationType:id,name',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',

            'users' => fn($q) => $q->orderBy('name')
                ->limit(self::PRINT_USERS_LIMIT),

            'survivors' => fn($q) => $q->orderByDesc('created_at')
                ->limit(self::PRINT_SURVIVORS_LIMIT),

            'gbvCases' => fn($q) => $q->orderByDesc('created_at')
                ->limit(self::PRINT_CASES_LIMIT),

            'outgoingReferrals' => fn($q) => $q->orderByDesc('created_at')
                ->limit(self::PRINT_REFERRALS_LIMIT)
                ->with('toPartner:id,organization_name'),

            'incomingReferrals' => fn($q) => $q->orderByDesc('created_at')
                ->limit(self::PRINT_REFERRALS_LIMIT)
                ->with('fromPartner:id,organization_name'),
        ])->loadCount(['users', 'survivors', 'gbvCases']);
    }

    // ------------------------------------------------------------------
    //  MUTATIONS
    // ------------------------------------------------------------------

    public function delete(Partner $partner): void
    {
        $partner->delete();
    }

    public function verifyOrReject(Partner $partner, string $action): string
    {
        if ($action === 'verify') {
            $partner->forceFill([
                'verified_at' => now(),
                'status' => 'approved',
                'verification_token' => null,
            ])->save();

            return "{$partner->organization_name} has been verified and approved.";
        }

        $partner->forceFill([
            'verified_at' => null,
            'status' => 'rejected',
        ])->save();

        return "{$partner->organization_name} has been rejected.";
    }

    // ------------------------------------------------------------------
    //  PDF RENDERING
    // ------------------------------------------------------------------

    public function renderListPdf(PartnerFilters $filters, User $actor): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::PDF_VIEW,
            ReportContext::make([
                'partners' => $this->exportCollection($filters, $actor),
                'filterSummary' => $this->filterSummary($filters),
            ]),
        )
            ->setPaper('a4', 'landscape')
            ->setOptions($this->pdfOptions());

        return $pdf->stream('partners-' . now()->format('Y-m-d') . '.pdf');
    }

    public function renderPartnerPdf(Partner $partner): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::PARTNER_PRINT_VIEW,
            ReportContext::make([
                'partner' => $this->findForPrint($partner),
            ]),
        )
            ->setPaper('a4', 'portrait')
            ->setOptions($this->pdfOptions());

        return $pdf->stream('partner-' . $partner->id . '.pdf');
    }

    // ------------------------------------------------------------------
    //  INTERNALS
    // ------------------------------------------------------------------

    private function buildQuery(PartnerFilters $filters, User $actor): Builder
    {
        $query = Partner::query()
            ->with([
                'organizationType:id,name',
                'county:id,name',
                'subCounty:id,name',
                'ward:id,name',
                'village:id,name',
            ])
            ->withCount([
                'users',
                'survivors',
                'gbvCases',
                'gbvCases as active_cases_count' => fn($q) => $q->whereIn('status', [
                    'open',
                    'in_progress',
                    'pending',
                ]),
            ]);

        if (!$actor->isSuperAdmin()) {
            $query->where('id', $actor->partner_id);
        }

        if ($filters->search !== '') {
            $term = '%' . $filters->search . '%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('organization_name', 'like', $term)
                    ->orWhere('registration_number', 'like', $term)
                    ->orWhere('contact_person', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term);
            });
        }

        if ($filters->status !== '') {
            $query->where('status', $filters->status);
        }

        if ($filters->organizationTypeId !== '') {
            $query->where('organization_type_id', $filters->organizationTypeId);
        }

        if ($filters->countyId !== '' && $filters->countyId !== null) {
            $query->where('county_id', $filters->countyId);
        }

        if ($filters->verified === '1') {
            $query->whereNotNull('verified_at');
        } elseif ($filters->verified === '0') {
            $query->whereNull('verified_at');
        }

        return $query->orderBy($filters->sort, $filters->dir);
    }

    private function filterSummary(PartnerFilters $filters): string
    {
        $bits = [];

        if ($filters->search !== '') {
            $bits[] = 'Search: "' . $filters->search . '"';
        }
        if ($filters->status !== '') {
            $bits[] = 'Status: ' . ucfirst($filters->status);
        }
        if ($filters->organizationTypeId !== '') {
            if ($type = \App\Models\OrganizationType::find($filters->organizationTypeId)) {
                $bits[] = 'Type: ' . $type->name;
            }
        }
        if ($filters->countyId !== '' && $filters->countyId !== null) {
            if ($county = \App\Models\County::find($filters->countyId)) {
                $bits[] = 'County: ' . $county->name;
            }
        }
        if ($filters->verified !== '') {
            $bits[] = 'Verified: ' . ($filters->verified === '1' ? 'Yes' : 'No');
        }

        return implode(' • ', $bits);
    }

    /**
     * @return array<string, mixed>
     */
    private function pdfOptions(): array
    {
        return [
            'isRemoteEnabled' => false,
            'isHtml5ParserEnabled' => true,
            'chroot' => public_path(),
            'defaultFont' => 'DejaVu Sans',
        ];
    }
}