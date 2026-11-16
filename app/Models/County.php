<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class County extends Model
{
    protected $fillable = [
        'code',
        'name'
    ];

    public function subCounties(): HasMany
    {
        return $this->hasMany(SubCounty::class);
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