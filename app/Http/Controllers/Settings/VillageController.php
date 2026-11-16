<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\Ward;

class VillageController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return Village::class;
    }

    protected function pageName(): string
    {
        return 'villages';
    }

    protected function defaultSort(): string
    {
        return 'name';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'name', 'code', 'ward_id'];
    }

    protected function fields(): array
    {
        return [
            [
                'name' => 'ward_id',
                'label' => 'Ward',
                'type' => 'select',
                'options' => Ward::with('subCounty.county')
                    ->orderBy('name')
                    ->get()
                    ->map(fn($w) => [
                        'id' => $w->id,
                        'name' => "{$w->subCounty->county->name} / {$w->subCounty->name} / {$w->name}",
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
            'ward_id' => ['required', 'exists:wards,id'],
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:villages,code' . ($id ? ",$id" : ''),
            ],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
