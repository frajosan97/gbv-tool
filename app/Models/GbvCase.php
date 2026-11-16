<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class GbvCase extends Model
{
    use SoftDeletes;

    protected $table = 'gbv_cases';

    protected $fillable = [
        'partner_id',
        'survivor_id',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'primary_officer_id',
        'created_by',
        'concluded_by',
        'case_number',
        'incident_number',
        'incident_type_id',
        'incident_type_other',
        'incident_date',
        'incident_time',
        'incident_location',
        'description',
        'reported_to_police',
        'police_station',
        'ob_number',
        'medical_attention',
        'health_facility',
        'case_status_id',
        'priority_level_id',
        'confidentiality_level_id',
        'conclusion_type_id',
        'conclusion_notes',
        'concluded_at',
        'is_sensitive',
        'consent_obtained',
        'consent_details',
        'metadata',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'incident_time' => 'string',
        'concluded_at' => 'datetime',
        'reported_to_police' => 'bool',
        'medical_attention' => 'bool',
        'is_sensitive' => 'bool',
        'consent_obtained' => 'bool',
        'metadata' => 'array',
    ];

    /* ---------- Ownership ---------- */

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function survivor(): BelongsTo
    {
        return $this->belongsTo(Survivor::class);
    }

    public function primaryOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_officer_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function concludedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'concluded_by');
    }

    /* ---------- Lookups ---------- */

    public function incidentType(): BelongsTo
    {
        return $this->belongsTo(IncidentType::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(CaseStatusOption::class, 'case_status_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(PriorityLevel::class, 'priority_level_id');
    }

    public function confidentiality(): BelongsTo
    {
        return $this->belongsTo(ConfidentialityLevel::class, 'confidentiality_level_id');
    }

    public function conclusionType(): BelongsTo
    {
        return $this->belongsTo(ConclusionType::class);
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

    /* ---------- Workflow ---------- */

    public function caseFiles(): HasMany
    {
        return $this->hasMany(CaseFile::class);
    }

    public function files(): HasMany
    {
        return $this->caseFiles();
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function perpetrators(): HasMany
    {
        return $this->hasMany(Perpetrator::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CaseNote::class);
    }

    public function timelines(): HasMany
    {
        return $this->hasMany(CaseTimeline::class);
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(CaseTimeline::class)->latest('happened_at');
    }

    public function conclusion(): HasOne
    {
        return $this->hasOne(CaseConclusion::class);
    }

    /* ---------- Scopes ---------- */

    /**
     * Partner-scoped scope used by /gbv-cases.
     * Super Admin bypasses scoping entirely.
     */
    public function scopeVisibleTo(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->can('manage gbv cases')) {
            return $query;
        }

        if ($actor->partner_id) {
            return $query->where('partner_id', $actor->partner_id);
        }

        return $query->where(function (Builder $q) use ($actor) {
            $q->where('created_by', $actor->id)
                ->orWhere('primary_officer_id', $actor->id);
        });
    }
}