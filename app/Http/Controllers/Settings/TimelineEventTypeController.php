<?php

namespace App\Http\Controllers\Settings;

use App\Concerns\HandlesLookupResource;
use App\Http\Controllers\Controller;
use App\Models\TimelineEventType;
use Illuminate\Validation\Rule;

class TimelineEventTypeController extends Controller
{
    use HandlesLookupResource;

    protected function modelClass(): string
    {
        return TimelineEventType::class;
    }

    protected function pageName(): string
    {
        return 'timeline-event-types';
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
            ['name' => 'icon', 'label' => 'Icon', 'type' => 'text', 'required' => true],
            ['name' => 'color', 'label' => 'Color', 'type' => 'color', 'required' => false],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'boolean', 'required' => false],
            ['name' => 'sort_order', 'label' => 'Sort Order', 'type' => 'number', 'required' => false],
        ];
    }

    protected function rules(?int $id = null): array
    {
        return [
            'slug' => ['required', 'string', 'max:255', Rule::unique('timeline_event_types', 'slug')->ignore($id)],
            'name' => ['required', 'string', 'max:255'],
            'icon' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}