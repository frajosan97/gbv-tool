<?php

namespace App\Http\Requests;

use App\Enums\ReferralStatus;
use App\Models\Referral;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReferralRequest extends FormRequest
{
    public function authorize(): bool
    {
        $referral = $this->route('referral');

        if (!$referral instanceof Referral) {
            return false;
        }

        return $this->user()?->can('update', $referral) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $referral = $this->route('referral');
        $user = $this->user();

        if (!$referral instanceof Referral || !$user) {
            return;
        }

        $policy = app(\App\Policies\ReferralPolicy::class);
        $isReceiver = $policy->isReceivingPartner($user, $referral);

        if ($isReceiver) {
            // Receiver can only touch status + feedback.
            $this->replace(
                array_intersect_key($this->all(), array_flip(['status', 'feedback']))
            );

            // Revert status choices that belong to the sender.
            $requested = $this->input('status');
            if (
                in_array($requested, [
                    ReferralStatus::Pending->value,
                    ReferralStatus::Cancelled->value,
                ], true)
            ) {
                $this->merge(['status' => $referral->status?->value]);
            }
        } else {
            // Sender can edit details, but not the receiver's decisions.
            $requested = $this->input('status');
            if (
                in_array($requested, [
                    ReferralStatus::Accepted->value,
                    ReferralStatus::Declined->value,
                    ReferralStatus::Completed->value,
                ], true)
            ) {
                $this->merge(['status' => $referral->status?->value]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $referral = $this->route('referral');
        $user = $this->user();

        $policy = app(\App\Policies\ReferralPolicy::class);
        $isReceiver = $referral instanceof Referral
            && $user
            && $policy->isReceivingPartner($user, $referral);

        if ($isReceiver) {
            return [
                'status' => [
                    'required',
                    Rule::in([
                        ReferralStatus::Accepted->value,
                        ReferralStatus::Declined->value,
                        ReferralStatus::Completed->value,
                    ]),
                ],
                'feedback' => ['nullable', 'string', 'max:5000'],
            ];
        }

        return [
            'to_partner_id' => ['required', 'integer', 'exists:partners,id'],
            'referral_type_id' => ['required', 'integer', 'exists:referral_types,id'],
            'urgency_option_id' => ['required', 'integer', 'exists:urgency_options,id'],
            'case_file_id' => ['nullable', 'integer', 'exists:case_files,id'],
            'reason' => ['required', 'string', 'max:2000'],
            'services_requested' => ['nullable', 'array'],
            'services_requested.*' => ['string', 'max:100'],
            'status' => [
                'required',
                Rule::in([
                    ReferralStatus::Pending->value,
                    ReferralStatus::Cancelled->value,
                ]),
            ],
            'feedback' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'to_partner_id.required' => 'Select the partner this referral is going to.',
            'referral_type_id.required' => 'Select the type of referral.',
            'urgency_option_id.required' => 'Select the urgency level.',
            'reason.required' => 'Explain why this referral is being made.',
        ];
    }
}