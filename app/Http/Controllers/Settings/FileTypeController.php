<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\FileType;
use Illuminate\Validation\Rule;

class FileTypeController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return FileType::class;
    }

    protected function pageName(): string
    {
        return 'file-types';
    }

    protected function sortableColumns(): array
    {
        return ['id', 'slug', 'name', 'is_evidence', 'requires_review', 'is_active', 'sort_order'];
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
            ['name' => 'color', 'label' => 'Color', 'type' => 'color', 'required' => false],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'required' => false],
            ['name' => 'is_evidence', 'label' => 'Is Evidence', 'type' => 'boolean', 'required' => false],
            ['name' => 'requires_review', 'label' => 'Requires Review', 'type' => 'boolean', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('file_types', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_evidence' => ['boolean'],
            'requires_review' => ['boolean'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}