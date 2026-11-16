<?php

namespace App\Data;

use Illuminate\Http\Request;

class GbvCaseFilters
{
    public function __construct(
        public readonly string $search = '',
        public readonly string $incidentTypeId = '',
        public readonly string $caseStatusId = '',
        public readonly string $priorityLevelId = '',
        public readonly string $confidentialityLevelId = '',
        public readonly string $countyId = '',
        public readonly string $subCountyId = '',
        public readonly string $wardId = '',
        public readonly string $partnerId = '',
        public readonly string $survivorId = '',
        public readonly string $isSensitive = '',
        public readonly string $reportedToPolice = '',
        public readonly string $medicalAttention = '',
        public readonly string $from = '',
        public readonly string $to = '',
        public readonly int $perPage = 15,
        public readonly string $sort = 'created_at',
        public readonly string $dir = 'desc',
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
            search: (string) $request->query('search', ''),
            incidentTypeId: (string) $request->query('incident_type_id', ''),
            caseStatusId: (string) $request->query('case_status_id', ''),
            priorityLevelId: (string) $request->query('priority_level_id', ''),
            confidentialityLevelId: (string) $request->query('confidentiality_level_id', ''),
            countyId: (string) $request->query('county_id', ''),
            subCountyId: (string) $request->query('sub_county_id', ''),
            wardId: (string) $request->query('ward_id', ''),
            partnerId: (string) $request->query('partner_id', ''),
            survivorId: (string) $request->query('survivor_id', ''),
            isSensitive: (string) $request->query('is_sensitive', ''),
            reportedToPolice: (string) $request->query('reported_to_police', ''),
            medicalAttention: (string) $request->query('medical_attention', ''),
            from: (string) $request->query('from', ''),
            to: (string) $request->query('to', ''),
            perPage: max(1, min(100, (int) $request->query('per_page', 15))),
            sort: $sort,
            dir: $dir,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'incident_type_id' => $this->incidentTypeId,
            'case_status_id' => $this->caseStatusId,
            'priority_level_id' => $this->priorityLevelId,
            'confidentiality_level_id' => $this->confidentialityLevelId,
            'county_id' => $this->countyId,
            'sub_county_id' => $this->subCountyId,
            'ward_id' => $this->wardId,
            'partner_id' => $this->partnerId,
            'survivor_id' => $this->survivorId,
            'is_sensitive' => $this->isSensitive,
            'reported_to_police' => $this->reportedToPolice,
            'medical_attention' => $this->medicalAttention,
            'from' => $this->from,
            'to' => $this->to,
            'per_page' => $this->perPage,
            'sort' => $this->sort,
            'dir' => $this->dir,
        ];
    }
}