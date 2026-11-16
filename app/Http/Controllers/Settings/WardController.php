<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\Ward;
use App\Models\SubCounty;

class WardController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return Ward::class;
    }

    protected function pageName(): string
    {
        return 'wards';
    }

    protected function defaultSort(): string
    {
        return 'name';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'name', 'code', 'sub_county_id'];
    }

    protected function fields(): array
    {
        return [
            [
                'name' => 'sub_county_id',
                'label' => 'Sub County',
                'type' => 'select',
                'options' => SubCounty::with('county')
                    ->orderBy('name')
                    ->get()
                    ->map(fn($s) => [
                        'id' => $s->id,
                        'name' => "{$s->county->name} / {$s->name}",
                    ])
                    ->toArray(),
                'required' => true,
            ],
            [
                'name' => 'code',
                'label' => 'Code',
                'type' => 'text',
                'required' => true,
            ],
            [
                'name' => 'name',
                'label' => 'Name',
                'type' => 'text',
                'required' => true,
            ],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'sub_county_id' => ['required', 'exists:sub_counties,id'],
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:wards,code' . ($id ? ",$id" : ''),
            ],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
