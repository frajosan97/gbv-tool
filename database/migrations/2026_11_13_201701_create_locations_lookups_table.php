<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /* ==================== LOCATIONS ==================== */
        Schema::create('counties', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('sub_counties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('county_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->index(['county_id', 'name']);
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_county_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->index(['sub_county_id', 'name']);
        });

        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->index(['ward_id', 'name']);
        });

        /* ==================== CASE LOOKUPS ==================== */
        Schema::create('incident_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['category', 'is_active']);
        });

        Schema::create('priority_levels', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('color');
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('confidentiality_levels', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('case_status_options', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('color');
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_concluded')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('conclusion_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('color');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('timeline_event_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon');
            $table->string('color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        /* ==================== REFERRAL LOOKUPS ==================== */
        Schema::create('referral_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('color');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('urgency_options', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('color');
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        /* ==================== PERSON LOOKUPS ==================== */
        Schema::create('id_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('requires_number')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('disability_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('category');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['category', 'is_active']);
        });

        Schema::create('age_ranges', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->unsignedTinyInteger('min_age')->nullable();
            $table->unsignedTinyInteger('max_age')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gender_options', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('relationship_options', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        /* ==================== FILE / NOTE LOOKUPS ==================== */
        Schema::create('file_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_evidence')->default(false);
            $table->boolean('requires_review')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('note_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_private_by_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'note_types',
            'file_types',
            'relationship_options',
            'gender_options',
            'age_ranges',
            'disability_types',
            'id_types',
            'urgency_options',
            'referral_types',
            'timeline_event_types',
            'conclusion_types',
            'case_status_options',
            'confidentiality_levels',
            'priority_levels',
            'incident_types',
            'villages',
            'wards',
            'sub_counties',
            'counties',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};