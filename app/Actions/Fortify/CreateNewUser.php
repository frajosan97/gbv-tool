<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            /* ---------- User Info ---------- */
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'phone' => ['required', 'string', 'max:20', Rule::unique(User::class)],
            'password' => $this->passwordRules(),

            /* ---------- Organization / Partner ---------- */
            'organization_name' => ['required', 'string', 'max:255'],
            'organization_type_id' => ['nullable', 'integer', 'exists:organization_types,id'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'year_established' => ['nullable', 'integer', 'min:1900', 'max:' . date('Y')],

            /* ---------- Location ---------- */
            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'sub_county_id' => ['nullable', 'integer', 'exists:sub_counties,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,id'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            // Create the Partner (Organization)
            $partner = Partner::create([
                'organization_name' => $input['organization_name'],
                'organization_type_id' => $input['organization_type_id'] ?? null,
                'registration_number' => $input['registration_number'] ?? null,
                'year_established' => $input['year_established'] ?? null,
                'contact_person' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'],
                'county_id' => $input['county_id'] ?? null,
                'sub_county_id' => $input['sub_county_id'] ?? null,
                'ward_id' => $input['ward_id'] ?? null,
                'village_id' => $input['village_id'] ?? null,
                'status' => 'pending',
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'data_sharing_consent' => true,
            ]);

            // Create the User linked to the Partner
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'phone' => $input['phone'],
                'password' => Hash::make($input['password']),
                'partner_id' => $partner->id,
                'county_id' => $input['county_id'] ?? null,
                'sub_county_id' => $input['sub_county_id'] ?? null,
                'ward_id' => $input['ward_id'] ?? null,
                'village_id' => $input['village_id'] ?? null,
            ]);

            // Assign the "Partner" role from the seeder
            $user->assignRole('Partner');

            return $user;
        });
    }
}