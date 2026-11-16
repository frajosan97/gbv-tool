<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SurvivorsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(
        private readonly Builder $query,
    ) {
    }

    public function query(): Builder
    {
        return $this->query;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'Unique code',
            'Name',
            'Phone',
            'Gender',
            'Age',
            'Age range',
            'PWD',
            'County',
            'Sub-county',
            'Ward',
            'Village',
            'Consent',
            'Registered at',
        ];
    }

    /**
     * @param \App\Models\Survivor $s
     * @return array<int, mixed>
     */
    public function map($s): array
    {
        return [
            $s->unique_code,
            $s->anonymous ? 'Anonymous' : ($s->full_name ?? '—'),
            $s->anonymous ? '—' : ($s->phone ?? '—'),
            $s->genderOption?->name ?? '—',
            $s->age ?? '—',
            $s->ageRange?->name ?? '—',
            $s->is_pwd ? 'Yes' : 'No',
            $s->county?->name ?? '—',
            $s->subCounty?->name ?? '—',
            $s->ward?->name ?? '—',
            $s->village?->name ?? '—',
            $s->consent_given ? 'Given' : 'Not given',
            $s->created_at?->toDateTimeString() ?? '—',
        ];
    }
}