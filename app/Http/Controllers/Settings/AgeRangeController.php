<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\AgeRange;
use Illuminate\Validation\Rule;

class AgeRangeController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return AgeRange::class;
    }

    protected function pageName(): string
    {
        return 'age-ranges';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'min_age', 'max_age', 'is_active', 'sort_order'];
    }

    protected function defaultSort(): string
    {
        return 'sort_order';
    }

    protected function searchableColumns(): array
    {
        return ['name', 'slug'];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
            ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
            ['name' => 'min_age', 'label' => 'Min Age', 'type' => 'number', 'required' => false],
            ['name' => 'max_age', 'label' => 'Max Age', 'type' => 'number', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('age_ranges', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'min_age' => ['nullable', 'integer', 'min:0', 'max:255'],
            'max_age' => ['nullable', 'integer', 'min:0', 'max:255', 'gte:min_age'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}