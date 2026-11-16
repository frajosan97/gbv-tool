<?php

namespace App\Http\Requests;

use App\Enums\ReferralStatus;
use App\Models\GbvCase;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReferralRequest extends FormRequest
{
    public function authorize(): bool
    {
        $case = $this->route('gbvCase');

        return $case instanceof GbvCase
            && ($this->user()?->can('update', $case) ?? false);
    }

    public function rules(): array
    {
        return [
            'to_partner_id' => ['required', 'integer', 'exists:partners,id'],
            'referral_type_id' => ['required', 'integer', 'exists:referral_types,id'],
            'urgency_option_id' => ['required', 'integer', 'exists:urgency_options,id'],
            'case_file_id' => ['nullable', 'integer', 'exists:case_files,id'],
            'reason' => ['required', 'string', 'max:2000'],
            'services_requested' => ['nullable', 'array'],
            'services_requested.*' => ['string', 'max:100'],
            'status' => ['required', Rule::enum(ReferralStatus::class)],
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