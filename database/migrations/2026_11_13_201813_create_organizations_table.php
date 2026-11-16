<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('organization_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('partners', function (Blueprint $table) {
            $table->id();

            // Organization
            $table->string('organization_name');
            $table->foreignId('organization_type_id')
                ->constrained('organization_types')
                ->restrictOnDelete();
            $table->string('registration_number')->nullable();
            $table->year('year_established')->nullable();

            // Contact
            $table->string('contact_person');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('alternate_phone')->nullable();

            // Location
            $table->foreignId('county_id')->nullable()->constrained('counties')->nullOnDelete();
            $table->foreignId('sub_county_id')->nullable()->constrained('sub_counties')->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained('villages')->nullOnDelete();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();

            // API
            $table->string('api_key')->nullable();
            $table->string('api_secret')->nullable();
            $table->json('api_settings')->nullable();

            // Extra
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('services_offered')->nullable();

            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_token')->nullable();

            // Consent
            $table->boolean('terms_accepted')->default(false);
            $table->boolean('data_sharing_consent')->default(false);
            $table->timestamp('terms_accepted_at')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('organization_name');
            $table->index(['status', 'verified_at']);
            $table->index(['county_id', 'sub_county_id', 'ward_id', 'village_id'], 'partners_location_index');
            $table->index(['organization_type_id', 'status'], 'partners_type_status_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partners');
        Schema::dropIfExists('organization_types');
    }
};