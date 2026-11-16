<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IdType extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'requires_number',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'requires_number' => 'bool',
        'is_active' => 'bool'
    ];

    public function survivors(): HasMany
    {
        return $this->hasMany(Survivor::class);
    }
}