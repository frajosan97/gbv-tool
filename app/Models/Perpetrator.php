<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Perpetrator extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'created_by',
        'name',
        'name_known',
        'gender_option_id',
        'age_range_id',
        'relationship_option_id',
        'relationship_details',
        'physical_description',
        'identifying_features',
        'is_repeat_offender',
        'previous_incidents_count',
        'additional_info',
    ];

    protected $casts = [
        'name_known' => 'bool',
        'is_repeat_offender' => 'bool',
        'previous_incidents_count' => 'integer',
        'physical_description' => 'array',
        'identifying_features' => 'array',
    ];

    public function gbvCase(): BelongsTo
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function genderOption(): BelongsTo
    {
        return $this->belongsTo(GenderOption::class);
    }

    public function ageRange(): BelongsTo
    {
        return $this->belongsTo(AgeRange::class);
    }

    public function relationshipOption(): BelongsTo
    {
        return $this->belongsTo(RelationshipOption::class);
    }
}