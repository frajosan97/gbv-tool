<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'organization_name',
        'organization_type_id',
        'registration_number',
        'year_established',
        'contact_person',
        'email',
        'phone',
        'alternate_phone',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'address',
        'city',
        'postal_code',
        'api_key',
        'api_secret',
        'api_settings',
        'website',
        'description',
        'services_offered',
        'status',
        'verified_at',
        'verification_token',
        'terms_accepted',
        'data_sharing_consent',
        'terms_accepted_at',
        'metadata',
    ];

    protected $casts = [
        'year_established' => 'integer',
        'api_settings' => 'array',
        'services_offered' => 'array',
        'metadata' => 'array',
        'verified_at' => 'datetime',
        'terms_accepted_at' => 'datetime',
        'terms_accepted' => 'bool',
        'data_sharing_consent' => 'bool',
    ];

    protected $hidden = ['api_secret', 'verification_token'];

    /* ---------- Relations ---------- */

    public function organizationType(): BelongsTo
    {
        return $this->belongsTo(OrganizationType::class);
    }

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

    public function caseFiles(): HasMany
    {
        return $this->hasMany(CaseFile::class);
    }

    public function outgoingReferrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'from_partner_id');
    }

    public function incomingReferrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'to_partner_id');
    }
}