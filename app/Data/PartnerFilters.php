<?php

namespace App\Data;

use Illuminate\Http\Request;

class PartnerFilters
{
    public function __construct(
        public readonly string $search,
        public readonly string $status,
        public readonly string $organizationTypeId,
        public readonly string $countyId,
        public readonly string $verified,
        public readonly string $sort,
        public readonly string $dir,
        public readonly int $perPage,
    ) {
    }

    public static function fromRequest(Request $request, array $allowedSorts): self
    {
        $sort = (string) $request->query('sort', 'organization_name');
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'organization_name';
        }

        $dir = strtolower((string) $request->query('dir', 'asc')) === 'desc' ? 'desc' : 'asc';

        return new self(
            search: trim((string) $request->query('search', '')),
            status: (string) $request->query('status', ''),
            organizationTypeId: (string) $request->query('organization_type_id', ''),
            countyId: (string) $request->query('county_id', ''),
            verified: (string) $request->query('verified', ''),
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
            'status' => $this->status,
            'organization_type_id' => $this->organizationTypeId,
            'county_id' => $this->countyId,
            'verified' => $this->verified,
            'sort' => $this->sort,
            'dir' => $this->dir,
            'per_page' => $this->perPage,
        ];
    }
}