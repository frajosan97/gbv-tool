<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\IdType;
use Illuminate\Validation\Rule;

class IdTypeController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return IdType::class;
    }

    protected function pageName(): string
    {
        return 'id-types';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'requires_number', 'is_active', 'sort_order'];
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
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'required' => false],
            ['name' => 'requires_number', 'label' => 'Requires Number', 'type' => 'boolean', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('id_types', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'requires_number' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}