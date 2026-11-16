<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('gbv_cases', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('partner_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('survivor_id')->constrained()->cascadeOnDelete();

            $table->foreignId('county_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sub_county_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('village_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('primary_officer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('concluded_by')->nullable()->constrained('users')->nullOnDelete();

            // Identification
            $table->string('case_number')->unique();
            $table->string('incident_number')->nullable()->unique();

            // Incident
            $table->foreignId('incident_type_id')->constrained('incident_types')->restrictOnDelete();
            $table->string('incident_type_other')->nullable();
            $table->date('incident_date')->nullable();
            $table->time('incident_time')->nullable();
            $table->string('incident_location')->nullable();
            $table->text('description');

            // Police
            $table->boolean('reported_to_police')->default(false);
            $table->string('police_station')->nullable();
            $table->string('ob_number')->nullable();

            // Medical
            $table->boolean('medical_attention')->default(false);
            $table->string('health_facility')->nullable();

            // Workflow
            $table->foreignId('case_status_id')->constrained('case_status_options')->restrictOnDelete();
            $table->foreignId('priority_level_id')->constrained('priority_levels')->restrictOnDelete();
            $table->foreignId('confidentiality_level_id')->constrained('confidentiality_levels')->restrictOnDelete();
            $table->foreignId('conclusion_type_id')->nullable()->constrained('conclusion_types')->nullOnDelete();

            $table->text('conclusion_notes')->nullable();
            $table->timestamp('concluded_at')->nullable();

            // Sensitivity
            $table->boolean('is_sensitive')->default(false);
            $table->boolean('consent_obtained')->default(true);
            $table->text('consent_details')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['case_status_id', 'priority_level_id']);
            $table->index(['incident_type_id', 'case_status_id']);
            $table->index(['incident_date', 'incident_type_id']);
            $table->index(['county_id', 'incident_type_id', 'case_status_id']);
            $table->index(['survivor_id', 'case_status_id']);
            $table->index('concluded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gbv_cases');
    }
};