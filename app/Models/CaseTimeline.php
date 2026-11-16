<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseTimeline extends Model
{
    protected $fillable = [
        'gbv_case_id',
        'timeline_event_type_id',
        'created_by',
        'title',
        'description',
        'metadata',
        'happened_at',
    ];

    protected $casts = [
        'happened_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(TimelineEventType::class, 'timeline_event_type_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}