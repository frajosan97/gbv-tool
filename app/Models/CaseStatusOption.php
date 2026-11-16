<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CaseStatusOption extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'color',
        'icon',
        'description',
        'is_active',
        'is_concluded',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool',
        'is_concluded' => 'bool'
    ];

    public function gbvCases(): HasMany
    {
        return $this->hasMany(GbvCase::class);
    }
}