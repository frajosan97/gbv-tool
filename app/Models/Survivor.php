<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Survivor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'partner_id',
        'unique_code',
        'full_name',
        'phone',
        'alternate_phone',
        'gender_option_id',
        'dob',
        'age',
        'age_range_id',
        'is_pwd',
        'disability_type_id',
        'pwd_registration_number',
        'id_type_id',
        'id_number',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'landmark',
        'location_coordinates',
        'anonymous',
        'consent_given',
        'consent_given_at',
        'consent_details',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship_id',
        'created_by',
        'metadata',
    ];

    protected $casts = [
        'dob' => 'date',
        'age' => 'integer',
        'is_pwd' => 'bool',
        'anonymous' => 'bool',
        'consent_given' => 'bool',
        'consent_given_at' => 'datetime',
        'location_coordinates' => 'array',
        'metadata' => 'array',
    ];

    /* ---------- Ownership ---------- */

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /* ---------- Lookups ---------- */

    public function genderOption(): BelongsTo
    {
        return $this->belongsTo(GenderOption::class);
    }

    public function ageRange(): BelongsTo
    {
        return $this->belongsTo(AgeRange::class);
    }

    public function disabilityType(): BelongsTo
    {
        return $this->belongsTo(DisabilityType::class);
    }

    public function idType(): BelongsTo
    {
        return $this->belongsTo(IdType::class);
    }

    public function emergencyContactRelationship(): BelongsTo
    {
        return $this->belongsTo(
            RelationshipOption::class,
            'emergency_contact_relationship_id',
        );
    }

    /* ---------- Location ---------- */

    public function county(): BelongsTo
    {
        return $this->belongsTo(County::class);
    }

    public function subCounty(): BelongsTo
    {
        return $this->belongsTo(SubCounty::class);
    }

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    /* ---------- Related records ---------- */

    public function gbvCases(): HasMany
    {
        return $this->hasMany(GbvCase::class);
    }

    /* ---------- Scopes ---------- */

    /**
     * Partner-scoped scope used by /survivors (the register).
     * Super Admin bypasses scoping entirely.
     */
    public function scopeVisibleTo(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->can('manage survivors')) {
            return $query;
        }

        if ($actor->partner_id) {
            return $query->where('partner_id', $actor->partner_id);
        }

        return $query->where(function (Builder $q) use ($actor) {
            $q->where('created_by', $actor->id);
        });
    }

    /**
     * Scope used when picking a survivor to attach to a GBV case.
     * Super Admin can attach any survivor, including anonymous ones.
     */
    public function scopeAttachableTo(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->can('manage survivors')) {
            return $query;
        }

        if ($actor->partner_id) {
            return $query->where(function (Builder $q) use ($actor) {
                $q->where('anonymous', false)
                    ->orWhere('partner_id', $actor->partner_id);
            });
        }

        return $query->where('anonymous', false);
    }
}