<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConclusionType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'color',
        'description',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool'
    ];

    public function gbvCases(): HasMany
    {
        return $this->hasMany(GbvCase::class);
    }

    public function caseConclusions(): HasMany
    {
        return $this->hasMany(CaseConclusion::class);
    }
}