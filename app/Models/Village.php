<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Village extends Model
{
    protected $fillable = [
        'ward_id',
        'code',
        'name'
    ];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
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