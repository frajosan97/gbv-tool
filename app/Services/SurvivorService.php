<?php

namespace App\Services;

use App\Data\SurvivorFilters;
use App\Http\Resources\SurvivorResource;
use App\Models\Survivor;
use App\Models\User;
use App\Support\ReportContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class SurvivorService
{
    public const ALLOWED_SORTS = [
        'unique_code',
        'full_name',
        'age',
        'created_at',
        'updated_at',
    ];

    public const MAX_EXPORT_ROWS = 5000;

    private const PDF_VIEW = 'reports.survivors-pdf';
    private const SURVIVOR_PRINT_VIEW = 'reports.survivor-print';
    private const SURVIVOR_CARD_VIEW = 'reports.survivor-card';

    private const PRINT_CASES_LIMIT = 50;

    // ------------------------------------------------------------------
    //  QUERIES
    // ------------------------------------------------------------------

    public function paginate(SurvivorFilters $filters, User $actor): LengthAwarePaginator
    {
        return $this->buildQuery($filters, $actor)
            ->paginate($filters->perPage)
            ->withQueryString()
            ->through(fn(Survivor $s) => (new SurvivorResource($s))->resolve());
    }

    public function exportQuery(SurvivorFilters $filters, User $actor): Builder
    {
        return $this->buildQuery($filters, $actor)->limit(self::MAX_EXPORT_ROWS);
    }

    public function exportCollection(SurvivorFilters $filters, User $actor): Collection
    {
        return $this->exportQuery($filters, $actor)->get();
    }

    public function findForShow(Survivor $survivor): Survivor
    {
        return $survivor->load([
            'partner:id,organization_name',
            'createdBy:id,name',
            'genderOption:id,name',
            'ageRange:id,name,min_age,max_age',
            'disabilityType:id,name',
            'idType:id,name,requires_number',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',
            'emergencyContactRelationship:id,name',
            'gbvCases' => fn($q) => $q
                ->with([
                    'status:id,name,slug,color',
                    'priority:id,name',
                    'incidentType:id,name',
                    'primaryOfficer:id,name',
                ])
                ->orderByDesc('created_at'),
        ])->loadCount(['gbvCases']);
    }

    public function findForPrint(Survivor $survivor): Survivor
    {
        return $survivor->load([
            'partner:id,organization_name',
            'createdBy:id,name',
            'genderOption:id,name',
            'ageRange:id,name,min_age,max_age',
            'disabilityType:id,name',
            'idType:id,name,requires_number',
            'county:id,name',
            'subCounty:id,name',
            'ward:id,name',
            'village:id,name',
            'emergencyContactRelationship:id,name',

            'gbvCases' => fn($q) => $q->orderByDesc('created_at')
                ->limit(self::PRINT_CASES_LIMIT),
        ])->loadCount(['gbvCases']);
    }

    // ------------------------------------------------------------------
    //  MUTATIONS
    // ------------------------------------------------------------------

    public function create(array $data, User $actor): Survivor
    {
        return DB::transaction(function () use ($data, $actor) {
            $data['unique_code'] = !empty($data['unique_code'])
                ? $data['unique_code']
                : $this->generateUniqueCode();

            $data['created_by'] = $actor->id;

            if (!$actor->isSuperAdmin()) {
                if ($actor->partner_id) {
                    $data['partner_id'] = $actor->partner_id;
                } elseif (empty($data['partner_id'])) {
                    $data['partner_id'] = null;
                }
            }

            $data = $this->deriveAgeAndRange($data);
            $data = $this->resolveVillage($data);

            return Survivor::create($data);
        });
    }

    public function update(Survivor $survivor, array $data, User $actor): Survivor
    {
        return DB::transaction(function () use ($survivor, $data, $actor) {
            if (!$actor->isSuperAdmin() && $actor->partner_id) {
                $data['partner_id'] = $actor->partner_id;
            }

            $data = $this->deriveAgeAndRange($data);
            $data = $this->resolveVillage($data);

            $survivor->fill($data)->save();

            return $survivor->refresh();
        });
    }

    public function delete(Survivor $survivor): void
    {
        $survivor->delete();
    }

    public function restore(Survivor $survivor): Survivor
    {
        $survivor->restore();

        return $survivor->refresh();
    }

    // ------------------------------------------------------------------
    //  DERIVATIONS
    // ------------------------------------------------------------------

    /**
     * Compute age (if missing) and age_range_id (if missing) from dob.
     * Respects client-submitted values; only fills missing ones.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function deriveAgeAndRange(array $data): array
    {
        if (empty($data['dob'])) {
            return $data;
        }

        try {
            $dob = \Carbon\Carbon::parse($data['dob']);
        } catch (\Throwable) {
            return $data;
        }

        if ($dob->isFuture()) {
            return $data;
        }

        if (empty($data['age'])) {
            $data['age'] = $dob->age;
        }

        if (empty($data['age_range_id'])) {
            $age = (int) $data['age'];

            $range = \App\Models\AgeRange::query()
                ->where(function ($q) use ($age) {
                    $q->whereNull('min_age')->orWhere('min_age', '<=', $age);
                })
                ->where(function ($q) use ($age) {
                    $q->whereNull('max_age')->orWhere('max_age', '>=', $age);
                })
                ->orderBy('min_age')
                ->first();

            if ($range) {
                $data['age_range_id'] = $range->id;
            }
        }

        return $data;
    }

    /**
     * Resolve the survivor's village.
     *
     *  1. If `village_id` is provided, use it as-is.
     *  2. Else if `village_name` is typed and `ward_id` is present:
     *       - find an existing village (case-insensitive) under that ward;
     *       - create it under that ward if it doesn't exist.
     *  3. Else set `village_id = null`.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function resolveVillage(array $data): array
    {
        if (!empty($data['village_id'])) {
            unset($data['village_name']);
            return $data;
        }

        $name = isset($data['village_name'])
            ? trim((string) $data['village_name'])
            : '';
        $wardId = $data['ward_id'] ?? null;

        if ($name === '' || !$wardId) {
            $data['village_id'] = null;
            unset($data['village_name']);
            return $data;
        }

        $village = \App\Models\Village::query()
            ->where('ward_id', $wardId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        if (!$village) {
            $village = \App\Models\Village::create([
                'ward_id' => (int) $wardId,
                'name' => $name,
                'code' => $this->generateVillageCode($name, (int) $wardId),
                'is_active' => true,
            ]);
        }

        $data['village_id'] = $village->id;
        unset($data['village_name']);

        return $data;
    }

    private function generateVillageCode(string $name, int $wardId): string
    {
        $base = strtoupper(preg_replace('/[^A-Z0-9]+/', '', Str::ascii($name)) ?: 'VIL');
        $base = substr($base, 0, 6) ?: 'VIL';

        do {
            $code = sprintf('%s-%d-%04d', $base, $wardId, random_int(0, 9999));
        } while (\App\Models\Village::where('code', $code)->exists());

        return $code;
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'SV-' . strtoupper(Str::random(8));
        } while (Survivor::withTrashed()->where('unique_code', $code)->exists());

        return $code;
    }

    // ------------------------------------------------------------------
    //  PDF RENDERING
    // ------------------------------------------------------------------

    public function renderListPdf(SurvivorFilters $filters, User $actor): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::PDF_VIEW,
            ReportContext::make([
                'survivors' => $this->exportCollection($filters, $actor),
                'filterSummary' => $this->filterSummary($filters),
            ]),
        )
            ->setPaper('a4', 'landscape')
            ->setOptions($this->pdfOptions());

        // stream() = inline (opens in the browser tab).
        // download() = attachment (forces save). We want inline.
        return $pdf->stream('survivors-' . now()->format('Y-m-d') . '.pdf');
    }

    public function renderSurvivorPdf(Survivor $survivor): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::SURVIVOR_PRINT_VIEW,
            ReportContext::make([
                'survivor' => $this->findForPrint($survivor),
            ]),
        )
            ->setPaper('a4', 'portrait')
            ->setOptions($this->pdfOptions());

        return $pdf->stream('survivor-' . $survivor->id . '.pdf');
    }

    public function renderSurvivorCardPdf(Survivor $survivor): HttpResponse
    {
        $pdf = Pdf::loadView(
            self::SURVIVOR_CARD_VIEW,
            ReportContext::make([
                'survivor' => $this->findForShow($survivor),
            ]),
        )
            // 242pt x 153pt = 85.6mm x 54mm (Standard ID-1 Card Size)
            ->setPaper([0, 0, 242, 153], 'landscape')
            ->setOptions($this->pdfOptions());

        return $pdf->stream('survivor-card-' . $survivor->unique_code . '.pdf');
    }

    // ------------------------------------------------------------------
    //  INTERNALS
    // ------------------------------------------------------------------

    private function buildQuery(SurvivorFilters $filters, User $actor): Builder
    {
        $query = Survivor::query()
            ->with([
                'partner:id,organization_name',
                'genderOption:id,name',
                'ageRange:id,name',
                'disabilityType:id,name',
                'idType:id,name',
                'county:id,name',
                'subCounty:id,name',
                'ward:id,name',
                'village:id,name',
            ])
            ->withCount(['gbvCases'])
            ->visibleTo($actor);

        if ($filters->search !== '') {
            $term = '%' . $filters->search . '%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('unique_code', 'like', $term)
                    ->orWhere('full_name', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('alternate_phone', 'like', $term)
                    ->orWhere('id_number', 'like', $term)
                    ->orWhere('pwd_registration_number', 'like', $term);
            });
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
        if ($filters->villageId !== '') {
            $query->where('village_id', $filters->villageId);
        }
        if ($filters->genderOptionId !== '') {
            $query->where('gender_option_id', $filters->genderOptionId);
        }
        if ($filters->ageRangeId !== '') {
            $query->where('age_range_id', $filters->ageRangeId);
        }
        if ($filters->isPwd === '1') {
            $query->where('is_pwd', true);
        } elseif ($filters->isPwd === '0') {
            $query->where('is_pwd', false);
        }
        if ($filters->anonymous === '1') {
            $query->where('anonymous', true);
        } elseif ($filters->anonymous === '0') {
            $query->where('anonymous', false);
        }
        if ($filters->consentGiven === '1') {
            $query->where('consent_given', true);
        } elseif ($filters->consentGiven === '0') {
            $query->where('consent_given', false);
        }
        if ($filters->partnerId !== '') {
            $query->where('partner_id', $filters->partnerId);
        }

        return $query->orderBy($filters->sort, $filters->dir);
    }

    private function filterSummary(SurvivorFilters $filters): string
    {
        $bits = [];

        if ($filters->search !== '') {
            $bits[] = 'Search: "' . $filters->search . '"';
        }
        if ($filters->countyId !== '') {
            if ($county = \App\Models\County::find($filters->countyId)) {
                $bits[] = 'County: ' . $county->name;
            }
        }
        if ($filters->genderOptionId !== '') {
            if ($gender = \App\Models\GenderOption::find($filters->genderOptionId)) {
                $bits[] = 'Gender: ' . $gender->name;
            }
        }
        if ($filters->ageRangeId !== '') {
            if ($ageRange = \App\Models\AgeRange::find($filters->ageRangeId)) {
                $bits[] = 'Age Range: ' . $ageRange->name;
            }
        }
        if ($filters->isPwd !== '') {
            $bits[] = 'PWD: ' . ($filters->isPwd === '1' ? 'Yes' : 'No');
        }
        if ($filters->anonymous !== '') {
            $bits[] = 'Anonymous: ' . ($filters->anonymous === '1' ? 'Yes' : 'No');
        }
        if ($filters->consentGiven !== '') {
            $bits[] = 'Consent: ' . ($filters->consentGiven === '1' ? 'Given' : 'Not Given');
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