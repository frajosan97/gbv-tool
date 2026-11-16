<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'referral_number' => $this->referral_number,
            'status' => $this->status?->value,
            'reason' => $this->reason,
            'services_requested' => $this->services_requested,
            'feedback' => $this->feedback,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),

            'referral_type' => $this->referralType
                ? ['id' => $this->referralType->id, 'name' => $this->referralType->name]
                : null,
            'urgency' => $this->urgency
                ? [
                    'id' => $this->urgency->id,
                    'name' => $this->urgency->name,
                    'color' => $this->urgency->color,
                ]
                : null,

            'from_partner' => $this->fromPartner
                ? ['id' => $this->fromPartner->id, 'name' => $this->fromPartner->organization_name]
                : null,
            'to_partner' => $this->toPartner
                ? ['id' => $this->toPartner->id, 'name' => $this->toPartner->organization_name]
                : null,

            'gbv_case' => $this->gbvCase
                ? [
                    'id' => $this->gbvCase->id,
                    'case_number' => $this->gbvCase->case_number,
                    'incident_number' => $this->gbvCase->incident_number,
                ]
                : null,

            'created_by' => $this->createdBy
                ? ['id' => $this->createdBy->id, 'name' => $this->createdBy->name]
                : null,

            'updates_count' => $this->whenCounted('updates'),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}