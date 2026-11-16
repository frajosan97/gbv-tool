<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimelineEventType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'color',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool'
    ];

    public function caseTimelines(): HasMany
    {
        return $this->hasMany(CaseTimeline::class);
    }
}