<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\IncidentType;
use Illuminate\Validation\Rule;

class IncidentTypeController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return IncidentType::class;
    }

    protected function pageName(): string
    {
        return 'incident-types';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'category', 'is_active', 'sort_order'];
    }

    protected function defaultSort(): string
    {
        return 'sort_order';
    }

    protected function searchableColumns(): array
    {
        return ['name', 'slug', 'category'];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
            ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'required' => true],
            ['name' => 'category', 'label' => 'Category', 'type' => 'text', 'required' => true],
            ['name' => 'icon', 'label' => 'Icon', 'type' => 'text', 'required' => false],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('incident_types', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}