<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\County;
use App\Models\SubCounty;
use App\Models\Ward;
use App\Models\Village;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    private ?int $countyId = null;
    private ?int $subCountyId = null;
    private ?int $wardId = null;
    private ?int $villageId = null;

    public function run(): void
    {
        $this->loadKituiLocationIds();

        if (!$this->countyId || !$this->subCountyId || !$this->wardId) {
            return;
        }

        $user = User::firstOrCreate(
            ['email' => 'super.admin@kituigbvmonitor.or.ke'],
            [
                'name' => 'Super Admin',
                'phone' => '0722000001',
                'password' => Hash::make('SuperAdmin@123'),
                'county_id' => $this->countyId,
                'sub_county_id' => $this->subCountyId,
                'ward_id' => $this->wardId,
                'village_id' => $this->villageId,
            ]
        );

        $user->syncRoles(['Super Admin']);
    }

    /*
    |--------------------------------------------------------------------------
    | Location Loader
    |--------------------------------------------------------------------------
    */
    private function loadKituiLocationIds(): void
    {
        $county = County::where('name', 'LIKE', '%Kitui%')->first();
        $this->countyId = $county?->id;

        $subCounty = SubCounty::where('name', 'LIKE', '%Kitui Central%')
            ->where('county_id', $this->countyId)
            ->first();

        $this->subCountyId = $subCounty?->id;

        $ward = Ward::where('name', 'LIKE', '%Township%')
            ->where('sub_county_id', $this->subCountyId)
            ->first();

        $this->wardId = $ward?->id;

        $village = Village::where('name', 'LIKE', '%Town%')
            ->where('ward_id', $this->wardId)
            ->first();

        $this->villageId = $village?->id;
    }
}
