<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\County;
use Illuminate\Validation\Rule;

class CountyController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return County::class;
    }

    protected function pageName(): string
    {
        return 'counties';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'code', 'name', 'sort_order'];
    }

    protected function defaultSort(): string
    {
        return 'name';
    }

    protected function searchableColumns(): array
    {
        return ['name', 'code'];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'code', 'label' => 'County Code', 'type' => 'text', 'required' => true],
            ['name' => 'name', 'label' => 'County Name', 'type' => 'text', 'required' => true],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('counties', 'code')->ignore($id),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('counties', 'name')->ignore($id),
            ],
        ];
    }
}