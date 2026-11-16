<?php

namespace App\Data;

use Illuminate\Http\Request;

class SurvivorFilters
{
    public function __construct(
        public readonly string $search,
        public readonly string $countyId,
        public readonly string $subCountyId,
        public readonly string $wardId,
        public readonly string $villageId,
        public readonly string $genderOptionId,
        public readonly string $ageRangeId,
        public readonly string $isPwd,
        public readonly string $anonymous,
        public readonly string $consentGiven,
        public readonly string $partnerId,
        public readonly string $sort,
        public readonly string $dir,
        public readonly int $perPage,
    ) {
    }

    /**
     * @param array<int, string> $allowedSorts
     */
    public static function fromRequest(Request $request, array $allowedSorts): self
    {
        $sort = (string) $request->query('sort', 'created_at');
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        $dir = strtolower((string) $request->query('dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        return new self(
            search: trim((string) $request->query('search', '')),
            countyId: (string) $request->query('county_id', ''),
            subCountyId: (string) $request->query('sub_county_id', ''),
            wardId: (string) $request->query('ward_id', ''),
            villageId: (string) $request->query('village_id', ''),
            genderOptionId: (string) $request->query('gender_option_id', ''),
            ageRangeId: (string) $request->query('age_range_id', ''),
            isPwd: (string) $request->query('is_pwd', ''),
            anonymous: (string) $request->query('anonymous', ''),
            consentGiven: (string) $request->query('consent_given', ''),
            partnerId: (string) $request->query('partner_id', ''),
            sort: $sort,
            dir: $dir,
            perPage: max(5, min(100, (int) $request->query('per_page', 15))),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'county_id' => $this->countyId,
            'sub_county_id' => $this->subCountyId,
            'ward_id' => $this->wardId,
            'village_id' => $this->villageId,
            'gender_option_id' => $this->genderOptionId,
            'age_range_id' => $this->ageRangeId,
            'is_pwd' => $this->isPwd,
            'anonymous' => $this->anonymous,
            'consent_given' => $this->consentGiven,
            'partner_id' => $this->partnerId,
            'sort' => $this->sort,
            'dir' => $this->dir,
            'per_page' => $this->perPage,
        ];
    }
}