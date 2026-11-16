<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgeRange extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'min_age',
        'max_age',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool'
    ];

    public function survivors(): HasMany
    {
        return $this->hasMany(Survivor::class);
    }

    public function perpetrators(): HasMany
    {
        return $this->hasMany(Perpetrator::class);
    }
}