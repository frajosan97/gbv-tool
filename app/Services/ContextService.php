<?php

namespace App\Services;

use App\Models\AgeRange;
use App\Models\CaseStatusOption;
use App\Models\ConclusionType;
use App\Models\ConfidentialityLevel;
use App\Models\County;
use App\Models\DisabilityType;
use App\Models\FileType;
use App\Models\GenderOption;
use App\Models\IdType;
use App\Models\IncidentType;
use App\Models\NoteType;
use App\Models\OrganizationType;
use App\Models\Partner;
use App\Models\PriorityLevel;
use App\Models\ReferralType;
use App\Models\RelationshipOption;
use App\Models\SubCounty;
use App\Models\TimelineEventType;
use App\Models\UrgencyOption;
use App\Models\Village;
use App\Models\Ward;
use Illuminate\Support\Collection;

class ContextService
{
    /* =========================================================
     |  GENERIC HELPERS
     | ========================================================= */

    protected function activeLookups(string $model): Collection
    {
        return $model::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /* =========================================================
     |  LOCATIONS
     | ========================================================= */

    public function counties(): Collection
    {
        return County::orderBy('name')->get();
    }

    public function subCounties(?int $countyId = null): Collection
    {
        return SubCounty::query()
            ->when($countyId, fn($q) => $q->where('county_id', $countyId))
            ->orderBy('name')
            ->get();
    }

    public function wards(?int $subCountyId = null): Collection
    {
        return Ward::query()
            ->when($subCountyId, fn($q) => $q->where('sub_county_id', $subCountyId))
            ->orderBy('name')
            ->get();
    }

    public function villages(?int $wardId = null): Collection
    {
        return Village::query()
            ->when($wardId, fn($q) => $q->where('ward_id', $wardId))
            ->orderBy('name')
            ->get();
    }

    /* =========================================================
     |  PARTNERS / ORGANIZATIONS
     | ========================================================= */

    public function partners(): Collection
    {
        return Partner::query()
            ->whereNull('deleted_at')
            ->orderBy('organization_name')
            ->get([
                'id',
                'organization_name',
                'contact_person',
                'email',
                'phone',
            ]);
    }

    public function organizationTypes(): Collection
    {
        return OrganizationType::query()
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /* =========================================================
     |  INCIDENT / PRIORITY / CONFIDENTIALITY
     | ========================================================= */

    public function incidentTypes(): Collection
    {
        return $this->activeLookups(IncidentType::class);
    }

    public function incidentTypesGroupedByCategory(): Collection
    {
        return $this->incidentTypes()->groupBy('category');
    }

    public function priorityLevels(): Collection
    {
        return $this->activeLookups(PriorityLevel::class);
    }

    public function confidentialityLevels(): Collection
    {
        return $this->activeLookups(ConfidentialityLevel::class);
    }

    /* =========================================================
     |  PERSON / DEMOGRAPHIC
     | ========================================================= */

    public function idTypes(): Collection
    {
        return $this->activeLookups(IdType::class);
    }

    public function disabilityTypes(): Collection
    {
        return $this->activeLookups(DisabilityType::class);
    }

    public function ageRanges(): Collection
    {
        return $this->activeLookups(AgeRange::class);
    }

    public function genderOptions(): Collection
    {
        return $this->activeLookups(GenderOption::class);
    }

    public function relationshipOptions(): Collection
    {
        return $this->activeLookups(RelationshipOption::class);
    }

    /* =========================================================
     |  CASE WORKFLOW
     | ========================================================= */

    public function caseStatuses(): Collection
    {
        return $this->activeLookups(CaseStatusOption::class);
    }

    public function conclusionTypes(): Collection
    {
        return $this->activeLookups(ConclusionType::class);
    }

    public function referralTypes(): Collection
    {
        return $this->activeLookups(ReferralType::class);
    }

    public function urgencyOptions(): Collection
    {
        return $this->activeLookups(UrgencyOption::class);
    }

    public function timelineEventTypes(): Collection
    {
        return $this->activeLookups(TimelineEventType::class);
    }

    /* =========================================================
     |  FILES / NOTES
     | ========================================================= */

    public function fileTypes(): Collection
    {
        return $this->activeLookups(FileType::class);
    }

    public function noteTypes(): Collection
    {
        return $this->activeLookups(NoteType::class);
    }

    /* =========================================================
     |  AGGREGATE — always a plain array, always fresh
     | ========================================================= */

    public function all(): array
    {
        return [
            // Locations
            'counties' => $this->counties()->values()->toArray(),
            'subCounties' => $this->subCounties()->values()->toArray(),
            'wards' => $this->wards()->values()->toArray(),
            'villages' => $this->villages()->values()->toArray(),

            // Partners / organizations
            'partners' => $this->partners()->values()->toArray(),
            'organizationTypes' => $this->organizationTypes()->values()->toArray(),

            // Incident / case
            'incidentTypes' => $this->incidentTypes()->values()->toArray(),
            'incidentTypesGrouped' => $this->incidentTypesGroupedByCategory()
                ->map(fn($g) => collect($g)->values()->toArray())
                ->toArray(),
            'priorityLevels' => $this->priorityLevels()->values()->toArray(),
            'confidentialityLevels' => $this->confidentialityLevels()->values()->toArray(),
            'caseStatuses' => $this->caseStatuses()->values()->toArray(),
            'conclusionTypes' => $this->conclusionTypes()->values()->toArray(),
            'referralTypes' => $this->referralTypes()->values()->toArray(),
            'urgencyOptions' => $this->urgencyOptions()->values()->toArray(),
            'timelineEventTypes' => $this->timelineEventTypes()->values()->toArray(),

            // Person / demographic
            'idTypes' => $this->idTypes()->values()->toArray(),
            'disabilityTypes' => $this->disabilityTypes()->values()->toArray(),
            'ageRanges' => $this->ageRanges()->values()->toArray(),
            'genderOptions' => $this->genderOptions()->values()->toArray(),
            'relationshipOptions' => $this->relationshipOptions()->values()->toArray(),

            // Files / notes
            'fileTypes' => $this->fileTypes()->values()->toArray(),
            'noteTypes' => $this->noteTypes()->values()->toArray(),
        ];
    }

    public function find(string $group, string $slug): mixed
    {
        return $this->{$group}()->firstWhere('slug', $slug);
    }
}