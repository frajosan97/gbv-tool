<?php

namespace App\Http\Requests;

use Closure;
use App\Models\GbvCase;
use App\Models\Survivor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGbvCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $case = $this->resolveCase();

        if (!$case instanceof GbvCase) {
            return false;
        }

        return (bool) $this->user()?->can('update', $case);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $case = $this->resolveCase();
        $caseId = $case?->id;

        return [
            'survivor_id' => [
                'sometimes',
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

            'case_number' => ['nullable', 'string', 'max:50', Rule::unique('gbv_cases', 'case_number')->ignore($caseId)->whereNull('deleted_at')],
            'incident_number' => ['nullable', 'string', 'max:50', Rule::unique('gbv_cases', 'incident_number')->ignore($caseId)->whereNull('deleted_at')],
            'incident_type_id' => ['sometimes', 'integer', 'exists:incident_types,id'],
            'incident_type_other' => ['nullable', 'string', 'max:255'],
            'incident_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'incident_time' => ['nullable', 'date_format:H:i'],
            'incident_location' => ['nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],

            'reported_to_police' => ['boolean'],
            'police_station' => ['nullable', 'string', 'max:255'],
            'ob_number' => ['nullable', 'string', 'max:100'],
            'medical_attention' => ['boolean'],
            'health_facility' => ['nullable', 'string', 'max:255'],

            'case_status_id' => ['sometimes', 'integer', 'exists:case_status_options,id'],
            'priority_level_id' => ['sometimes', 'integer', 'exists:priority_levels,id'],
            'confidentiality_level_id' => ['sometimes', 'integer', 'exists:confidentiality_levels,id'],

            'is_sensitive' => ['boolean'],
            'consent_obtained' => ['boolean'],
            'consent_details' => ['nullable', 'string', 'max:2000'],

            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Resolve the GbvCase from the route, tolerating parameter-name variants
     * and falling back to type-scanning the bound parameters.
     */
    private function resolveCase(): ?GbvCase
    {
        $candidates = [
            'gbvCase',
            'gbv_case',
            'case',
        ];

        foreach ($candidates as $name) {
            $param = $this->route($name);

            if ($param instanceof GbvCase) {
                return $param;
            }
        }

        // Fallback: scan all route parameters for a bound GbvCase
        foreach ($this->route()?->parameters() ?? [] as $param) {
            if ($param instanceof GbvCase) {
                return $param;
            }
        }

        // Fallback: resolve from a raw id if implicit binding did not run
        foreach ($candidates as $name) {
            $id = $this->route($name);

            if (is_numeric($id)) {
                return GbvCase::find((int) $id);
            }
        }

        return null;
    }
}