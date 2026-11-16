<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\PriorityLevel;
use Illuminate\Validation\Rule;

class PriorityLevelController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return PriorityLevel::class;
    }

    protected function pageName(): string
    {
        return 'priority-levels';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'color', 'is_active', 'sort_order'];
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
            ['name' => 'color', 'label' => 'Color', 'type' => 'color', 'required' => true],
            ['name' => 'icon', 'label' => 'Icon', 'type' => 'text', 'required' => false],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('priority_levels', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}