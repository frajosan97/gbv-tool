<?php

namespace App\Models;

use App\Concerns\IsLookup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RelationshipOption extends Model
{
    use IsLookup;

    protected $fillable = [
        'slug',
        'name',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_active' => 'bool'
    ];

    public function survivorsAsEmergencyContact(): HasMany
    {
        return $this->hasMany(Survivor::class, 'emergency_contact_relationship_id');
    }

    public function perpetrators(): HasMany
    {
        return $this->hasMany(Perpetrator::class);
    }
}