<?php

namespace App\Http\Requests;

use App\Models\Perpetrator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePerpetratorRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Perpetrator|null $perpetrator */
        $perpetrator = $this->route('perpetrator');

        if (!$perpetrator) {
            return false;
        }

        return $this->user()?->can('update', $perpetrator) ?? false;
    }

    /**
     * Normalise the boolean toggles before validation so unchecked
     * checkboxes arrive as `false` instead of being absent.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name_known' => $this->boolean('name_known'),
            'is_repeat_offender' => $this->boolean('is_repeat_offender'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255', 'required_if:name_known,true'],
            'name_known' => ['boolean'],

            'gender_option_id' => ['nullable', 'integer', Rule::exists('gender_options', 'id')],
            'age_range_id' => ['nullable', 'integer', Rule::exists('age_ranges', 'id')],
            'relationship_option_id' => ['nullable', 'integer', Rule::exists('relationship_options', 'id')],

            'relationship_details' => ['nullable', 'string', 'max:255'],

            'physical_description_text' => ['nullable', 'string', 'max:5000'],
            'identifying_features_text' => ['nullable', 'string', 'max:5000'],

            'is_repeat_offender' => ['boolean'],
            'previous_incidents_count' => [
                'nullable',
                'integer',
                'min:0',
                'max:999',
                'required_if:is_repeat_offender,true',
            ],

            'additional_info' => ['nullable', 'string', 'max:10000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required_if' => 'Please provide the perpetrator\'s name, or mark it as unknown.',
            'previous_incidents_count.required_if' => 'Enter how many previous incidents were recorded.',
            'gender_option_id.exists' => 'Select a valid gender option.',
            'age_range_id.exists' => 'Select a valid age range.',
            'relationship_option_id.exists' => 'Select a valid relationship option.',
        ];
    }

    public function attributes(): array
    {
        return [
            'gender_option_id' => 'gender',
            'age_range_id' => 'age range',
            'relationship_option_id' => 'relationship',
            'relationship_details' => 'relationship details',
            'physical_description_text' => 'physical description',
            'identifying_features_text' => 'identifying features',
            'previous_incidents_count' => 'previous incidents',
            'additional_info' => 'additional information',
        ];
    }
}