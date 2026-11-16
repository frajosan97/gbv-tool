<?php

namespace App\Services;

use App\Data\GbvCaseFilters;
use App\Http\Resources\GbvCaseResource;
use App\Models\CaseNote;
use App\Models\GbvCase;
use App\Models\User;
use App\Support\CaseFilePdfBuilder;
use App\Support\LogsTimeline;
use App\Support\PdfMerger;
use App\Support\ReportContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GbvCaseService
{
    use LogsTimeline;

    public const ALLOWED_SORTS = [
        'case_number',
        'incident_date',
        'created_at',
        'updated_at',
        'concluded_at',
    ];

    public const MAX_EXPORT_ROWS = 5000;

    private const PDF_VIEW = 'reports.gbv-cases-pdf';
    private const CASE_PRINT_VIEW = 'reports.gbv-case-print';
    private const PRINT_RELATED_LIMIT = 50;

    /* ---------- Queries ---------- */

    public function paginate(GbvCaseFilters $filters, User $actor): LengthAwarePaginator
    {
        return $this->buildQuery($filters, $actor)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn(GbvCase $c) => (new GbvCaseResource($c))->resolve());
    }

    public function exportQuery(GbvCaseFilters $filters, User $actor): Builder
    {
        return $this->buildQuery($filters, $actor)->limit(self::MAX_EXPORT_ROWS);
    }

    public function exportCollection(GbvCaseFilters $filters, User $actor): Collection
    {
        return $this->exportQuery($filters, $actor)->get();
    }

    public function findForShow(GbvCase $case): GbvCase
    {
        return $case->load([
            'partner:id,organization_name',
            'survivor:id,unique_code,full_name,anonymous',
            'primaryOfficer:id,name',
            'createdBy:id,name',
            'concludedBy:id,name',
            'incidentType:id,name',
            'status:id,name',
            'priority:id,name',
            'confidentiality:id,name',
            'conclusionType:id,name',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',

            // ---- Tab relations ----
            'caseFiles' => fn($q) => $q
                ->with(['fileType:id,name', 'createdBy:id,name'])
                ->latest(),

            'perpetrators' => fn($q) => $q->with([
                'genderOption:id,name',
                'ageRange:id,name',
                'relationshipOption:id,name',
            ])->latest(),

            'referrals' => fn($q) => $q->with([
                'referralType:id,name',
                'urgency:id,name',
                'fromPartner:id,organization_name',
                'toPartner:id,organization_name',
                'caseFile:id,title',
                'createdBy:id,name',
            ])->latest(),

            'notes' => fn($q) => $q
                ->with(['noteType:id,name,slug,icon,color', 'createdBy:id,name'])
                ->latest(),

            'timelines' => fn($q) => $q
                ->with(['eventType:id,slug,name', 'user:id,name'])
                ->orderByDesc('happened_at'),
        ])->loadCount([
                    'caseFiles',
                    'referrals',
                    'perpetrators',
                    'notes as notes_count' => fn($q) => $this->restrictNoteVisibility($q, request()->user()),
                ]);
    }

    public function findForPrint(GbvCase $case): GbvCase
    {
        return $case->load([
            'partner:id,organization_name',
            'survivor:id,unique_code,full_name,anonymous',
            'primaryOfficer:id,name',
            'createdBy:id,name',
            'concludedBy:id,name',
            'incidentType:id,name',
            'status:id,name',
            'priority:id,name',
            'confidentiality:id,name',
            'conclusionType:id,name',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',

            // ---- Print relations (bounded, private notes excluded) ----
            'caseFiles' => fn($q) => $q
                ->with(['fileType:id,name', 'createdBy:id,name'])
                ->orderByDesc('created_at')
                ->limit(self::PRINT_RELATED_LIMIT),

            'perpetrators' => fn($q) => $q->with([
                'genderOption:id,name',
                'ageRange:id,name',
                'relationshipOption:id,name',
            ])->orderByDesc('created_at')
                ->limit(self::PRINT_RELATED_LIMIT),

            'referrals' => fn($q) => $q->with([
                'referralType:id,name',
                'urgency:id,name',
                'fromPartner:id,organization_name',
                'toPartner:id,organization_name',
                'caseFile:id,title',
                'createdBy:id,name',
            ])->orderByDesc('created_at')
                ->limit(self::PRINT_RELATED_LIMIT),

            'notes' => fn($q) => $q
                ->with(['noteType:id,name,slug,icon,color', 'createdBy:id,name'])
                ->where('is_private', false)
                ->orderByDesc('created_at')
                ->limit(self::PRINT_RELATED_LIMIT),

            'timelines' => fn($q) => $q
                ->with(['eventType:id,slug,name', 'user:id,name'])
                ->orderByDesc('happened_at')
                ->limit(self::PRINT_RELATED_LIMIT),
        ])->loadCount([
                    'caseFiles',
                    'referrals',
                    'perpetrators',
                    'notes as notes_count' => fn($q) => $q->where('is_private', false),
                ]);
    }

    /* ---------- Mutations ---------- */

    public function create(array $data, User $actor): GbvCase
    {
        return DB::transaction(function () use ($data, $actor) {
            $data['case_number'] = !empty($data['case_number'])
                ? $data['case_number']
                : $this->generateCaseNumber();

            $data['incident_number'] = !empty($data['incident_number'])
                ? $data['incident_number']
                : $this->generateIncidentNumber();

            $data['created_by'] = $actor->id;

            if (empty($data['primary_officer_id'])) {
                $data['primary_officer_id'] = $actor->id;
            }

            if (!$actor->isSuperAdmin()) {
                if ($actor->partner_id) {
                    $data['partner_id'] = $actor->partner_id;
                } elseif (empty($data['partner_id'])) {
                    $data['partner_id'] = null;
                }
            }

            $case = GbvCase::create($data);

            $this->logTimeline(
                $case,
                'created',
                "Case {$case->case_number} registered",
                null,
                $actor,
                [
                    'attributes' => $case->only(array_keys($data)),
                    'incident_number' => $case->incident_number,
                ],
            );

            return $case;
        });
    }

    public function update(GbvCase $case, array $data, User $actor): GbvCase
    {
        return DB::transaction(function () use ($case, $data, $actor) {
            if (!$actor->isSuperAdmin() && $actor->partner_id) {
                $data['partner_id'] = $actor->partner_id;
            }

            if (
                isset($data['survivor_id'])
                && (int) $data['survivor_id'] !== (int) $case->survivor_id
            ) {
                $ok = \App\Models\Survivor::query()
                    ->attachableTo($actor)
                    ->whereKey($data['survivor_id'])
                    ->exists();

                if (!$ok) {
                    unset($data['survivor_id']);
                }
            }

            $before = $case->getOriginal();
            $case->fill($data);

            if ($case->isDirty()) {
                $diff = $this->diffForTimeline($before, $case->getAttributes());
                $case->save();

                $this->logTimeline(
                    $case,
                    'updated',
                    "Case {$case->case_number} updated",
                    "Changed: {$diff['summary']}",
                    $actor,
                    $diff['changed'],
                );
            }

            return $case->refresh();
        });
    }

    public function conclude(GbvCase $case, array $data, User $actor): GbvCase
    {
        return DB::transaction(function () use ($case, $data, $actor) {
            $case->fill([
                'conclusion_type_id' => $data['conclusion_type_id'],
                'conclusion_notes' => $data['conclusion_notes'] ?? null,
                'concluded_at' => now(),
                'concluded_by' => $actor->id,
            ])->save();

            $this->logTimeline(
                $case,
                'concluded',
                "Case {$case->case_number} concluded",
                $case->conclusion_notes,
                $actor,
                ['conclusion_type_id' => $case->conclusion_type_id],
            );

            return $case->refresh();
        });
    }

    public function delete(GbvCase $case, ?User $actor = null): void
    {
        DB::transaction(function () use ($case, $actor) {
            $this->logTimeline(
                $case,
                'deleted',
                "Case {$case->case_number} deleted",
                null,
                $actor,
            );

            $case->delete();
        });
    }

    public function restore(GbvCase $case, ?User $actor = null): GbvCase
    {
        return DB::transaction(function () use ($case, $actor) {
            $case->restore();

            $this->logTimeline(
                $case,
                'restored',
                "Case {$case->case_number} restored",
                null,
                $actor,
            );

            return $case->refresh();
        });
    }

    /* ---------- Generators ---------- */

    private function generateCaseNumber(): string
    {
        do {
            $code = 'GBV-' . now()->format('Y') . '-' . strtoupper(Str::random(6));
        } while (GbvCase::withTrashed()->where('case_number', $code)->exists());

        return $code;
    }

    private function generateIncidentNumber(): string
    {
        do {
            $code = 'INC-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
        } while (GbvCase::withTrashed()->where('incident_number', $code)->exists());

        return $code;
    }

    /* ---------- PDF ---------- */

    public function renderListPdf(GbvCaseFilters $filters, User $actor): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::PDF_VIEW,
            ReportContext::make([
                'cases' => $this->exportCollection($filters, $actor),
                'filterSummary' => $this->filterSummary($filters),
            ]),
        )
            ->setPaper('a4', 'landscape')
            ->setOptions($this->pdfOptions());

        return $pdf->stream('gbv-cases-' . now()->format('Y-m-d') . '.pdf');
    }

    public function renderCasePdf(GbvCase $case): HttpResponse
    {
        $mainPdf = Pdf::loadView(
            self::CASE_PRINT_VIEW,
            ReportContext::make([
                'case' => $this->findForPrint($case),
            ]),
        )
            ->setPaper('a4', 'portrait')
            ->setOptions($this->pdfOptions());

        $files = $case->caseFiles ?? collect();

        if ($files->isEmpty()) {
            return $mainPdf->stream('gbv-case-' . $case->id . '.pdf');
        }

        $mainPath = tempnam(sys_get_temp_dir(), 'gbv_main_') . '.pdf';
        $mainPdf->save($mainPath);

        $attachmentPaths = [];
        $mergedPath = null;

        try {
            foreach ($files as $file) {
                $pdfPath = CaseFilePdfBuilder::toPdf($file);
                if ($pdfPath) {
                    $attachmentPaths[] = $pdfPath;
                }
            }

            $mergedPath = tempnam(sys_get_temp_dir(), 'gbv_merged_') . '.pdf';
            PdfMerger::merge(array_merge([$mainPath], $attachmentPaths), $mergedPath);

            return response()
                ->file($mergedPath, ['Content-Type' => 'application/pdf'])
                ->setContentDisposition('inline', 'gbv-case-' . $case->id . '.pdf')
                ->deleteFileAfterSend(true);
        } finally {
            @unlink($mainPath);
            foreach ($attachmentPaths as $p) {
                @unlink($p);
            }
        }
    }

    /* ---------- Internals ---------- */

    private function buildQuery(GbvCaseFilters $filters, User $actor): Builder
    {
        $query = GbvCase::query()
            ->with([
                'partner:id,organization_name',
                'survivor:id,unique_code,full_name,anonymous',
                'primaryOfficer:id,name',
                'incidentType:id,name',
                'status:id,name',
                'priority:id,name',
                'confidentiality:id,name',
                'county:id,name',
                'subCounty:id,name',
                'ward:id,name',
                'village:id,name',
            ])
            ->withCount([
                'caseFiles',
                'referrals',
                'perpetrators',
                'notes as notes_count' => fn($q) => $this->restrictNoteVisibility($q, $actor),
            ])
            ->visibleTo($actor);

        if ($filters->search !== '') {
            $term = '%' . $filters->search . '%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('case_number', 'like', $term)
                    ->orWhere('incident_number', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('incident_location', 'like', $term)
                    ->orWhere('ob_number', 'like', $term);
            });
        }

        if ($filters->incidentTypeId !== '') {
            $query->where('incident_type_id', $filters->incidentTypeId);
        }
        if ($filters->caseStatusId !== '') {
            $query->where('case_status_id', $filters->caseStatusId);
        }
        if ($filters->priorityLevelId !== '') {
            $query->where('priority_level_id', $filters->priorityLevelId);
        }
        if ($filters->confidentialityLevelId !== '') {
            $query->where('confidentiality_level_id', $filters->confidentialityLevelId);
        }
        if ($filters->countyId !== '') {
            $query->where('county_id', $filters->countyId);
        }
        if ($filters->subCountyId !== '') {
            $query->where('sub_county_id', $filters->subCountyId);
        }
        if ($filters->wardId !== '') {
            $query->where('ward_id', $filters->wardId);
        }
        if ($filters->partnerId !== '') {
            $query->where('partner_id', $filters->partnerId);
        }
        if ($filters->survivorId !== '') {
            $query->where('survivor_id', $filters->survivorId);
        }
        if ($filters->isSensitive === '1') {
            $query->where('is_sensitive', true);
        } elseif ($filters->isSensitive === '0') {
            $query->where('is_sensitive', false);
        }
        if ($filters->reportedToPolice === '1') {
            $query->where('reported_to_police', true);
        } elseif ($filters->reportedToPolice === '0') {
            $query->where('reported_to_police', false);
        }
        if ($filters->medicalAttention === '1') {
            $query->where('medical_attention', true);
        } elseif ($filters->medicalAttention === '0') {
            $query->where('medical_attention', false);
        }
        if ($filters->from !== '') {
            $query->whereDate('incident_date', '>=', $filters->from);
        }
        if ($filters->to !== '') {
            $query->whereDate('incident_date', '<=', $filters->to);
        }

        return $query->orderBy($filters->sort, $filters->dir);
    }

    /**
     * Apply the viewer's visibility rules to a note count/subquery.
     * Falls back to "public only" when there is no authenticated user.
     */
    private function restrictNoteVisibility($q, ?User $user): void
    {
        if (!$user) {
            $q->where('is_private', false);
            return;
        }

        if ($user->isSuperAdmin() || $user->can('view private case notes')) {
            return;
        }

        $q->where(function ($q) use ($user) {
            $q->where('is_private', false)
                ->orWhere('created_by', $user->id);
        });
    }

    private function filterSummary(GbvCaseFilters $filters): string
    {
        $bits = [];

        if ($filters->search !== '') {
            $bits[] = 'Search: "' . $filters->search . '"';
        }
        if ($filters->incidentTypeId !== '') {
            if ($t = \App\Models\IncidentType::find($filters->incidentTypeId)) {
                $bits[] = 'Incident: ' . $t->name;
            }
        }
        if ($filters->caseStatusId !== '') {
            if ($s = \App\Models\CaseStatusOption::find($filters->caseStatusId)) {
                $bits[] = 'Status: ' . $s->name;
            }
        }
        if ($filters->priorityLevelId !== '') {
            if ($p = \App\Models\PriorityLevel::find($filters->priorityLevelId)) {
                $bits[] = 'Priority: ' . $p->name;
            }
        }
        if ($filters->countyId !== '') {
            if ($c = \App\Models\County::find($filters->countyId)) {
                $bits[] = 'County: ' . $c->name;
            }
        }
        if ($filters->isSensitive !== '') {
            $bits[] = 'Sensitive: ' . ($filters->isSensitive === '1' ? 'Yes' : 'No');
        }
        if ($filters->reportedToPolice !== '') {
            $bits[] = 'Police: ' . ($filters->reportedToPolice === '1' ? 'Reported' : 'Not Reported');
        }
        if ($filters->medicalAttention !== '') {
            $bits[] = 'Medical: ' . ($filters->medicalAttention === '1' ? 'Yes' : 'No');
        }
        if ($filters->from !== '' || $filters->to !== '') {
            $bits[] = 'Dates: ' . ($filters->from ?: '…') . ' → ' . ($filters->to ?: '…');
        }

        return implode(' • ', $bits);
    }

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