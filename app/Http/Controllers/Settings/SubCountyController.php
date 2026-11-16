<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\SubCounty;

class SubCountyController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return SubCounty::class;
    }

    protected function pageName(): string
    {
        return 'sub-counties';
    }

    protected function defaultSort(): string
    {
        return 'name';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'name', 'code', 'county_id'];
    }

    protected function fields(): array
    {
        return [
            [
                'name' => 'county_id',
                'label' => 'County',
                'type' => 'select',
                'options' => \App\Models\County::orderBy('name')
                    ->get(['id', 'name'])
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
            'county_id' => ['required', 'exists:counties,id'],
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:sub_counties,code' . ($id ? ",$id" : ''),
            ],
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
