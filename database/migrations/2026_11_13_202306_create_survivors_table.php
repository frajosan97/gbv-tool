<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('survivors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('partner_id')->nullable()->constrained()->nullOnDelete();

            // Identification
            $table->string('unique_code')->unique();
            $table->string('full_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('alternate_phone')->nullable();

            // Gender (nullable only when anonymous)
            $table->foreignId('gender_option_id')->nullable()
                ->constrained('gender_options')->nullOnDelete();

            // Age
            $table->date('dob')->nullable();
            $table->unsignedTinyInteger('age')->nullable();
            $table->foreignId('age_range_id')->nullable()
                ->constrained('age_ranges')->nullOnDelete();

            // Disability
            $table->boolean('is_pwd')->default(false);
            $table->foreignId('disability_type_id')->nullable()
                ->constrained('disability_types')->nullOnDelete();
            $table->string('pwd_registration_number')->nullable();

            // ID
            $table->string('id_number')->nullable();
            $table->foreignId('id_type_id')->nullable()
                ->constrained('id_types')->nullOnDelete();

            // Location
            $table->foreignId('county_id')->nullable()->constrained('counties')->nullOnDelete();
            $table->foreignId('sub_county_id')->nullable()->constrained('sub_counties')->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained('villages')->nullOnDelete();
            $table->string('landmark')->nullable();
            $table->json('location_coordinates')->nullable();

            // Consent
            $table->boolean('anonymous')->default(false);
            $table->boolean('consent_given')->default(false);
            $table->timestamp('consent_given_at')->nullable();
            $table->json('consent_details')->nullable();

            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->foreignId('emergency_contact_relationship_id')->nullable()
                ->constrained('relationship_options')->nullOnDelete();

            $table->json('metadata')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('unique_code');
            $table->index('phone');
            $table->index(['id_number', 'id_type_id'], 'idx_survivors_id_doc');
            $table->index(['partner_id', 'id_number', 'id_type_id'], 'idx_survivors_partner_doc');
            $table->index(['county_id', 'sub_county_id', 'ward_id', 'village_id'], 'idx_survivors_location');
            $table->index(['created_at', 'age_range_id'], 'idx_survivors_created_age');
            $table->index(['county_id', 'created_at'], 'idx_survivors_county_created');
            $table->index(['sub_county_id', 'age_range_id'], 'idx_survivors_subcounty_age');
            $table->index(['ward_id', 'is_pwd'], 'idx_survivors_ward_pwd');
            $table->index(['village_id', 'is_pwd'], 'idx_survivors_village_pwd');
            $table->index(['gender_option_id', 'age_range_id'], 'idx_survivors_gender_age');
            $table->index(['county_id', 'gender_option_id', 'age_range_id'], 'idx_survivors_county_gender_age');
        });

        // MySQL-only virtual column
        if (
            Schema::hasTable('survivors')
            && !app()->runningUnitTests()
            && in_array(DB::getDriverName(), ['mysql', 'mariadb'])
        ) {
            DB::statement("
                ALTER TABLE survivors
                ADD COLUMN age_calculated INT
                GENERATED ALWAYS AS (TIMESTAMPDIFF(YEAR, dob, CURDATE())) VIRTUAL
            ");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('survivors');
    }
};