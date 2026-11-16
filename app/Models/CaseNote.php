<?php
// app/Models/CaseNote.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'created_by',
        'note_type_id',
        'content',
        'is_private',
        'is_important',
        'attachments',
        'metadata',
    ];

    protected $casts = [
        'is_private' => 'bool',
        'is_important' => 'bool',
        'attachments' => 'array',
        'metadata' => 'array',
    ];

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function author(): BelongsTo
    {
        return $this->createdBy();
    }

    public function noteType(): BelongsTo
    {
        return $this->belongsTo(NoteType::class);
    }
}