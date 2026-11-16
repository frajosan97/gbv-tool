<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseConclusion extends Model
{
    protected $fillable = [
        'gbv_case_id',
        'conclusion_type_id',
        'concluded_by',
        'notes',
        'concluded_at',
    ];

    protected $casts = [
        'concluded_at' => 'datetime',
    ];

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function concludedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'concluded_by');
    }
}