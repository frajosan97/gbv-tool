<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\GenderOption;
use Illuminate\Validation\Rule;

class GenderOptionController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return GenderOption::class;
    }

    protected function pageName(): string
    {
        return 'gender-options';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'is_active', 'sort_order'];
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
            ['name' => 'icon', 'label' => 'Icon', 'type' => 'text', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('gender_options', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}