<?php

namespace App\Data;

use Illuminate\Http\Request;

final class DashboardFilters
{
    public function __construct(
        public readonly string $period = 'all',
        public readonly ?int $partnerId = null,
        public readonly ?int $countyId = null,
        public readonly ?int $subCountyId = null,
        public readonly ?int $wardId = null,
        public readonly ?int $villageId = null,
        public readonly ?int $genderId = null,
        public readonly ?int $ageRangeId = null,
        public readonly ?int $disabilityTypeId = null,
        public readonly ?int $incidentTypeId = null,
        public readonly ?string $dateFrom = null,
        public readonly ?string $dateTo = null,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        $v = $request->validate([
            'period' => ['nullable', 'in:7d,30d,90d,all'],
            'partner_id' => ['nullable', 'integer', 'exists:partners,id'],
            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'sub_county_id' => ['nullable', 'integer', 'exists:sub_counties,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,id'],
            'gender_id' => ['nullable', 'integer', 'exists:gender_options,id'],
            'age_range_id' => ['nullable', 'integer', 'exists:age_ranges,id'],
            'disability_type_id' => ['nullable', 'integer', 'exists:disability_types,id'],
            'incident_type_id' => ['nullable', 'integer', 'exists:incident_types,id'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $int = fn($k) => isset($v[$k]) && $v[$k] !== '' ? (int) $v[$k] : null;

        return new self(
            period: $v['period'] ?? 'all',
            partnerId: $int('partner_id'),
            countyId: $int('county_id'),
            subCountyId: $int('sub_county_id'),
            wardId: $int('ward_id'),
            villageId: $int('village_id'),
            genderId: $int('gender_id'),
            ageRangeId: $int('age_range_id'),
            disabilityTypeId: $int('disability_type_id'),
            incidentTypeId: $int('incident_type_id'),
            dateFrom: $v['date_from'] ?? null,
            dateTo: $v['date_to'] ?? null,
        );
    }

    public function toState(): array
    {
        return [
            'period' => $this->period,
            'partner_id' => (string) ($this->partnerId ?? ''),
            'county_id' => (string) ($this->countyId ?? ''),
            'sub_county_id' => (string) ($this->subCountyId ?? ''),
            'ward_id' => (string) ($this->wardId ?? ''),
            'village_id' => (string) ($this->villageId ?? ''),
            'gender_id' => (string) ($this->genderId ?? ''),
            'age_range_id' => (string) ($this->ageRangeId ?? ''),
            'disability_type_id' => (string) ($this->disabilityTypeId ?? ''),
            'incident_type_id' => (string) ($this->incidentTypeId ?? ''),
            'date_from' => $this->dateFrom ?? '',
            'date_to' => $this->dateTo ?? '',
        ];
    }
}