<?php

namespace App\Http\Requests;

use App\Models\IdType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSurvivorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Survivor::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $anonymous = $this->boolean('anonymous');

        return [
            'partner_id' => ['nullable', 'integer', 'exists:partners,id'],

            // Contact — phone is optional (children may not own one).
            'full_name' => [Rule::requiredIf(!$anonymous), 'nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'alternate_phone' => ['nullable', 'string', 'max:30'],

            // Gender and DOB required (unless anonymous).
            'gender_option_id' => [
                Rule::requiredIf(!$anonymous),
                'nullable',
                'integer',
                'exists:gender_options,id',
            ],
            'dob' => [
                Rule::requiredIf(!$anonymous),
                'nullable',
                'date',
                'before:today',
            ],

            // Derived server-side if missing; still accepted from client.
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'age_range_id' => ['nullable', 'integer', 'exists:age_ranges,id'],

            'is_pwd' => ['boolean'],
            'disability_type_id' => [
                Rule::requiredIf($this->boolean('is_pwd')),
                'nullable',
                'integer',
                'exists:disability_types,id',
            ],
            'pwd_registration_number' => ['nullable', 'string', 'max:255'],

            // ID number required only if the selected ID type demands it.
            'id_number' => [
                Rule::requiredIf(fn() => $this->idTypeRequiresNumber()),
                'nullable',
                'string',
                'max:255',
            ],
            'id_type_id' => ['nullable', 'integer', 'exists:id_types,id'],

            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'sub_county_id' => ['nullable', 'integer', 'exists:sub_counties,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,id'],
            // Free-text village name — resolved (found-or-created) in the service.
            'village_name' => ['nullable', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'location_coordinates' => ['nullable', 'array'],
            'location_coordinates.lat' => ['nullable', 'numeric', 'between:-90,90'],
            'location_coordinates.lng' => ['nullable', 'numeric', 'between:-180,180'],

            'anonymous' => ['boolean'],
            'consent_given' => ['boolean'],
            'consent_given_at' => ['nullable', 'date'],
            'consent_details' => ['nullable', 'array'],

            // Emergency contact — required unless anonymous.
            'emergency_contact_name' => [
                Rule::requiredIf(!$anonymous),
                'nullable',
                'string',
                'max:255',
            ],
            'emergency_contact_phone' => [
                Rule::requiredIf(!$anonymous),
                'nullable',
                'string',
                'max:30',
            ],
            'emergency_contact_relationship_id' => [
                'nullable',
                'integer',
                'exists:relationship_options,id',
            ],

            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Enforce a ward when the user types a village name that isn't in
     * the list — the service needs a parent ward to find-or-create it.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (
                $this->filled('village_name') &&
                !$this->filled('village_id') &&
                !$this->filled('ward_id')
            ) {
                $v->errors()->add(
                    'village_name',
                    'Select a ward before typing a village name.',
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'anonymous' => $this->boolean('anonymous'),
            'is_pwd' => $this->boolean('is_pwd'),
            'consent_given' => $this->boolean('consent_given'),
        ]);

        // If not PWD, clear PWD-only fields so they don't linger.
        if (!$this->boolean('is_pwd')) {
            $this->merge([
                'disability_type_id' => null,
                'pwd_registration_number' => null,
            ]);
        }

        // If the selected ID type doesn't need a number, drop it.
        if ($this->filled('id_type_id') && !$this->idTypeRequiresNumber()) {
            $this->merge(['id_number' => null]);
        }

        if ($this->boolean('consent_given') && !$this->filled('consent_given_at')) {
            $this->merge(['consent_given_at' => now()]);
        }
    }

    private function idTypeRequiresNumber(): bool
    {
        if (!$this->filled('id_type_id')) {
            return false;
        }

        return (bool) IdType::whereKey($this->input('id_type_id'))
            ->value('requires_number');
    }
}