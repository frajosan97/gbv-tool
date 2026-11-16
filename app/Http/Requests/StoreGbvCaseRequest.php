<?php

namespace App\Http\Requests;

use App\Models\Survivor;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGbvCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\GbvCase::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'survivor_id' => [
                'required',
                'integer',
                function (string $attribute, $value, Closure $fail) {
                    $ok = Survivor::query()
                        ->attachableTo($this->user())
                        ->whereKey($value)
                        ->exists();

                    if (!$ok) {
                        $fail('You cannot attach this survivor to a case.');
                    }
                },
            ],
            'partner_id' => ['nullable', 'integer', 'exists:partners,id'],
            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'sub_county_id' => ['nullable', 'integer', 'exists:sub_counties,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,id'],
            'primary_officer_id' => ['nullable', 'integer', 'exists:users,id'],

            'case_number' => ['nullable', 'string', 'max:50', Rule::unique('gbv_cases', 'case_number')->whereNull('deleted_at')],
            'incident_number' => ['nullable', 'string', 'max:50', Rule::unique('gbv_cases', 'incident_number')->whereNull('deleted_at')],
            'incident_type_id' => ['required', 'integer', 'exists:incident_types,id'],
            'incident_type_other' => ['nullable', 'string', 'max:255'],
            'incident_date' => ['required', 'date', 'before_or_equal:today'],
            'incident_time' => ['nullable', 'date_format:H:i'],
            'incident_location' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],

            'reported_to_police' => ['boolean'],
            'police_station' => ['nullable', 'string', 'max:255', 'required_if:reported_to_police,true'],
            'ob_number' => ['nullable', 'string', 'max:100'],
            'medical_attention' => ['boolean'],
            'health_facility' => ['nullable', 'string', 'max:255', 'required_if:medical_attention,true'],

            'case_status_id' => ['required', 'integer', 'exists:case_status_options,id'],
            'priority_level_id' => ['required', 'integer', 'exists:priority_levels,id'],
            'confidentiality_level_id' => ['required', 'integer', 'exists:confidentiality_levels,id'],

            'is_sensitive' => ['boolean'],
            'consent_obtained' => ['boolean'],
            'consent_details' => ['nullable', 'string', 'max:2000', 'required_if:consent_obtained,true'],

            'metadata' => ['nullable', 'array'],
        ];
    }
}