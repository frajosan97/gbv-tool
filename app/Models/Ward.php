<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ward extends Model
{
    protected $fillable = [
        'sub_county_id',
        'code',
        'name'
    ];

    public function subCounty(): BelongsTo
    {
        return $this->belongsTo(SubCounty::class);
    }

    public function villages(): HasMany
    {
        return $this->hasMany(Village::class);
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