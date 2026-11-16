<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin \App\Models\Survivor */
class SurvivorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'unique_code' => $this->unique_code,
            'full_name' => $this->anonymous ? null : $this->full_name,
            'phone' => $this->anonymous ? null : $this->phone,
            'alternate_phone' => $this->anonymous ? null : $this->alternate_phone,

            'gender_option' => $this->whenLoaded(
                'genderOption',
                fn() => $this->genderOption?->only('id', 'name'),
            ),
            'dob' => $this->dob ? Carbon::parse($this->dob)->toDateString() : null,
            'age' => $this->age,
            'age_range' => $this->whenLoaded(
                'ageRange',
                fn() => $this->ageRange?->only('id', 'name', 'min_age', 'max_age'),
            ),

            'is_pwd' => (bool) $this->is_pwd,
            'disability_type' => $this->whenLoaded(
                'disabilityType',
                fn() => $this->disabilityType?->only('id', 'name'),
            ),
            'pwd_registration_number' => $this->pwd_registration_number,

            'id_number' => $this->anonymous ? null : $this->id_number,
            'id_type' => $this->whenLoaded(
                'idType',
                fn() => $this->idType?->only('id', 'name', 'requires_number'),
            ),

            'county' => $this->whenLoaded(
                'county',
                fn() => $this->county?->only('id', 'name'),
            ),
            'sub_county' => $this->whenLoaded(
                'subCounty',
                fn() => $this->subCounty?->only('id', 'name'),
            ),
            'ward' => $this->whenLoaded(
                'ward',
                fn() => $this->ward?->only('id', 'name'),
            ),
            'village' => $this->whenLoaded(
                'village',
                fn() => $this->village?->only('id', 'name'),
            ),
            'village_name' => $this->village_name,
            'landmark' => $this->landmark,
            'location_coordinates' => $this->location_coordinates,

            'anonymous' => (bool) $this->anonymous,
            'consent_given' => (bool) $this->consent_given,
            'consent_given_at' => $this->consent_given_at?->toIso8601String(),

            'emergency_contact_name' => $this->anonymous ? null : $this->emergency_contact_name,
            'emergency_contact_phone' => $this->anonymous ? null : $this->emergency_contact_phone,
            'emergency_contact_relationship' => $this->whenLoaded(
                'emergencyContactRelationship',
                fn() => $this->emergencyContactRelationship?->only('id', 'name'),
            ),

            'partner' => $this->whenLoaded(
                'partner',
                fn() => $this->partner?->only('id', 'organization_name'),
            ),
            'created_by' => $this->whenLoaded(
                'createdBy',
                fn() => $this->createdBy?->only('id', 'name'),
            ),

            'gbv_cases_count' => $this->whenCounted('gbvCases'),

            'gbv_cases' => $this->whenLoaded(
                'gbvCases',
                fn() => $this->gbvCases
                    ->map(fn($c) => [
                        'id' => $c->id,
                        'case_number' => $c->case_number,
                        'incident_number' => $c->incident_number,
                        'incident_type' => $c->incidentType?->name,
                        'incident_date' => $c->incident_date?->toDateString(),
                        'status' => $c->status?->name,
                        'status_slug' => $c->status?->slug,
                        'status_color' => $c->status?->color,
                        'priority' => $c->priority?->name,
                        'officer' => $c->primaryOfficer?->only('id', 'name'),
                        'is_sensitive' => (bool) $c->is_sensitive,
                        'created_at' => $c->created_at?->toIso8601String(),
                        'updated_at' => $c->updated_at?->toIso8601String(),
                    ])
                    ->values()
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}