<?php

namespace App\Models;

use App\Enums\ReferralStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Referral extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'referral_number',
        'gbv_case_id',
        'case_file_id',
        'from_partner_id',
        'to_partner_id',
        'created_by',
        'referral_type_id',
        'urgency_option_id',
        'reason',
        'services_requested',
        'status',
        'accepted_at',
        'completed_at',
        'feedback',
    ];

    protected $casts = [
        'services_requested' => 'array',
        'status' => ReferralStatus::class,
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations                                                           */
    /* ------------------------------------------------------------------ */

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class);
    }

    public function fromPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'from_partner_id');
    }

    public function toPartner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'to_partner_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function referralType(): BelongsTo
    {
        return $this->belongsTo(ReferralType::class);
    }

    public function urgency(): BelongsTo
    {
        return $this->belongsTo(UrgencyOption::class, 'urgency_option_id');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ReferralUpdate::class);
    }

    /* ------------------------------------------------------------------ */
    /* Scopes                                                              */
    /* ------------------------------------------------------------------ */

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', [
            ReferralStatus::Pending->value,
            ReferralStatus::Accepted->value,
        ]);
    }

    public function scopeClosed(Builder $query): Builder
    {
        return $query->whereIn('status', [
            ReferralStatus::Completed->value,
            ReferralStatus::Declined->value,
            ReferralStatus::Cancelled->value,
        ]);
    }
}