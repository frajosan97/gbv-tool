<?php

namespace App\Support;

use App\Models\GbvCase;
use App\Models\TimelineEventType;
use App\Models\User;

trait LogsTimeline
{
    /** @var array<string,int> */
    protected static array $timelineTypeCache = [];

    protected function logTimeline(
        GbvCase $case,
        string $typeSlug,
        string $title,
        ?string $description = null,
        ?User $actor = null,
        array $metadata = [],
    ): void {
        $case->timelines()->create([
            'timeline_event_type_id' => $this->resolveTimelineTypeId($typeSlug),
            'title' => $title,
            'description' => $description,
            'created_by' => $actor?->id,
            'metadata' => $metadata ?: null,
            'happened_at' => now(),
        ]);
    }

    protected function resolveTimelineTypeId(string $slug): int
    {
        if (isset(self::$timelineTypeCache[$slug])) {
            return self::$timelineTypeCache[$slug];
        }

        $type = TimelineEventType::firstOrCreate(
            ['slug' => $slug],
            $this->timelineTypeDefaults($slug),
        );

        return self::$timelineTypeCache[$slug] = $type->id;
    }

    /**
     * Defaults used when a timeline event type is auto-created.
     *
     * @return array<string,mixed>
     */
    protected function timelineTypeDefaults(string $slug): array
    {
        $meta = $this->timelineTypeMeta($slug);

        return [
            'name' => $meta['name'],
            'icon' => $meta['icon'],
            'color' => $meta['color'],
            'is_active' => true,
            'sort_order' => $meta['sort_order'],
        ];
    }

    /**
     * Static catalog of every timeline event type the app can emit.
     *
     * @return array{name:string,icon:string,color:string,sort_order:int}
     */
    protected function timelineTypeMeta(string $slug): array
    {
        return match ($slug) {
            'created' => [
                'name' => 'Case Created',
                'icon' => 'heroicon-o-plus-circle',
                'color' => 'emerald',
                'sort_order' => 10,
            ],
            'updated' => [
                'name' => 'Case Updated',
                'icon' => 'heroicon-o-pencil-square',
                'color' => 'blue',
                'sort_order' => 20,
            ],
            'concluded' => [
                'name' => 'Case Concluded',
                'icon' => 'heroicon-o-check-badge',
                'color' => 'green',
                'sort_order' => 30,
            ],
            'deleted' => [
                'name' => 'Case Deleted',
                'icon' => 'heroicon-o-trash',
                'color' => 'red',
                'sort_order' => 40,
            ],
            'restored' => [
                'name' => 'Case Restored',
                'icon' => 'heroicon-o-arrow-path',
                'color' => 'amber',
                'sort_order' => 50,
            ],
            'file' => [
                'name' => 'File Operation',
                'icon' => 'heroicon-o-paper-clip',
                'color' => 'slate',
                'sort_order' => 60,
            ],
            default => [
                'name' => ucfirst(str_replace('_', ' ', $slug)),
                'icon' => 'heroicon-o-document-text',
                'color' => 'gray',
                'sort_order' => 999,
            ],
        };
    }

    /**
     * @return array{changed: array<string,array{from:mixed,to:mixed}>, summary: string}
     */
    protected function diffForTimeline(array $before, array $after): array
    {
        $changed = [];

        foreach ($after as $key => $newValue) {
            $oldValue = $before[$key] ?? null;

            if ($oldValue != $newValue) {
                $changed[$key] = ['from' => $oldValue, 'to' => $newValue];
            }
        }

        return [
            'changed' => $changed,
            'summary' => $changed ? implode(', ', array_keys($changed)) : 'no field changes',
        ];
    }
}