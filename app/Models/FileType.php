<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FileType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'color',
        'description',
        'is_evidence',
        'requires_review',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_evidence' => 'bool',
        'requires_review' => 'bool',
        'is_active' => 'bool',
    ];

    public function caseFiles(): HasMany
    {
        return $this->hasMany(CaseFile::class);
    }
}