<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NoteType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'color',
        'description',
        'is_private_by_default',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_private_by_default' => 'bool',
        'is_active' => 'bool',
    ];

    public function caseNotes(): HasMany
    {
        return $this->hasMany(CaseNote::class);
    }
}