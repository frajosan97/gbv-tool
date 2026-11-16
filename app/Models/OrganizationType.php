<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'description',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'bool'
    ];

    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class);
    }
}