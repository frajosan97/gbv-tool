<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConfidentialityLevel extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
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
}