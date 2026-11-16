<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationTypesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Hospital/Health Facility', 'slug' => 'hospital', 'icon' => 'hospital', 'sort_order' => 1],
            ['name' => 'Police Station/Law Enforcement', 'slug' => 'police', 'icon' => 'shield', 'sort_order' => 2],
            ['name' => 'Non-Governmental Organization (NGO)', 'slug' => 'ngo', 'icon' => 'handshake', 'sort_order' => 3],
            ['name' => 'Community Based Organization (CBO)', 'slug' => 'cbo', 'icon' => 'users', 'sort_order' => 4],
            ['name' => 'Faith Based Organization (FBO)', 'slug' => 'fbo', 'icon' => 'church', 'sort_order' => 5],
            ['name' => 'Government Agency', 'slug' => 'government', 'icon' => 'landmark', 'sort_order' => 6],
            ['name' => 'Legal Aid/Justice Center', 'slug' => 'legal', 'icon' => 'scale', 'sort_order' => 7],
            ['name' => 'Shelter/Safe House', 'slug' => 'shelter', 'icon' => 'house', 'sort_order' => 8],
            ['name' => 'Educational Institution', 'slug' => 'education', 'icon' => 'book-open', 'sort_order' => 9],
            ['name' => 'International Organization', 'slug' => 'international', 'icon' => 'globe', 'sort_order' => 10],
            ['name' => 'Private Sector/Corporate', 'slug' => 'private', 'icon' => 'briefcase', 'sort_order' => 11],
            ['name' => 'Other', 'slug' => 'other', 'icon' => 'file-text', 'sort_order' => 12],
        ];

        DB::table('organization_types')->upsert(
            $types,
            ['slug'],
            ['name', 'icon', 'sort_order']
        );
    }
}