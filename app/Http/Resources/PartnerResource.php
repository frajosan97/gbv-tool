<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Partner */
class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_name' => $this->organization_name,
            'registration_number' => $this->registration_number,
            'year_established' => $this->year_established,
            'contact_person' => $this->contact_person,
            'email' => $this->email,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,

            'status' => $this->status,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'is_verified' => !is_null($this->verified_at),

            // ---------- Relations ----------
            'organization_type' => $this->whenLoaded(
                'organizationType',
                fn() => $this->organizationType?->only('id', 'name'),
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

            // ---------- Detail fields (shown on `show`) ----------
            'website' => $this->website,
            'description' => $this->description,
            'services_offered' => $this->services_offered ?? [],
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,

            // ---------- Aggregates ----------
            'users_count' => $this->whenCounted('users'),
            'survivors_count' => $this->whenCounted('survivors'),
            'gbv_cases_count' => $this->whenCounted('gbvCases'),
            'active_cases_count' => $this->whenCounted('active_cases_count'),

            // ---------- Hydrated collections (show only) ----------
            'users' => $this->whenLoaded('users', fn() => $this->users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? null,
                'created_at' => $u->created_at?->toIso8601String(),
            ])),

            'survivors' => $this->whenLoaded('survivors', fn() => $this->survivors->map(fn($s) => [
                'id' => $s->id,
                'unique_code' => $s->unique_code,
                'full_name' => $s->anonymous ? null : $s->full_name,
                'anonymous' => (bool) $s->anonymous,
                'status' => $s->status ?? null,
                'created_at' => $s->created_at?->toIso8601String(),
            ])),

            'gbv_cases' => $this->whenLoaded('gbvCases', fn() => $this->gbvCases->map(fn($c) => [
                'id' => $c->id,
                'case_number' => $c->case_number ?? null,
                'status' => $c->status ?? null,
                'created_at' => $c->created_at?->toIso8601String(),
            ])),

            // ---------- Timestamps ----------
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}