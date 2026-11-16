<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubCounty extends Model
{
    protected $fillable = [
        'county_id',
        'code',
        'name'
    ];

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function wards(): HasMany
    {
        return $this->hasMany(Ward::class);
    }

    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function survivors(): HasMany
    {
        return $this->hasMany(Survivor::class);
    }

    public function gbvCases(): HasMany
    {
        return $this->hasMany(GbvCase::class);
    }
}