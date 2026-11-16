<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /* ==================== FILES ==================== */
        Schema::create('case_files', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('referral_id')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('file_number')->unique();
            $table->foreignId('file_type_id')->constrained('file_types')->restrictOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'file_type_id']);
            $table->index(['gbv_case_id', 'referral_id']);
        });

        /* ==================== REFERRALS ==================== */
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();

            $table->string('referral_number')->unique();
            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('case_file_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('from_partner_id')->nullable()->constrained('partners')->nullOnDelete();
            $table->foreignId('to_partner_id')->constrained('partners')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('referral_type_id')->constrained('referral_types')->restrictOnDelete();
            $table->foreignId('urgency_option_id')->constrained('urgency_options')->restrictOnDelete();

            $table->text('reason');
            $table->json('services_requested')->nullable();

            $table->enum('status', [
                'pending',
                'accepted',
                'declined',
                'completed',
                'cancelled',
            ])->default('pending');

            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('feedback')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['from_partner_id', 'status']);
            $table->index(['to_partner_id', 'status']);
            $table->index(['gbv_case_id', 'status']);
        });

        Schema::create('referral_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['referral_id', 'created_at']);
        });

        /* ==================== PERPETRATORS ==================== */
        Schema::create('perpetrators', function (Blueprint $table) {
            $table->id();

            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name')->nullable();
            $table->boolean('name_known')->default(false);

            $table->foreignId('gender_option_id')->nullable()->constrained('gender_options')->nullOnDelete();
            $table->foreignId('age_range_id')->nullable()->constrained('age_ranges')->nullOnDelete();
            $table->foreignId('relationship_option_id')->nullable()->constrained('relationship_options')->nullOnDelete();
            $table->text('relationship_details')->nullable();

            $table->json('physical_description')->nullable();
            $table->json('identifying_features')->nullable();

            $table->boolean('is_repeat_offender')->default(false);
            $table->unsignedInteger('previous_incidents_count')->nullable();

            $table->text('additional_info')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'gender_option_id']);
        });

        /* ==================== NOTES ==================== */
        Schema::create('case_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('note_type_id')->nullable()->constrained('note_types')->nullOnDelete();

            $table->text('content');

            $table->boolean('is_private')->default(false);
            $table->boolean('is_important')->default(false);

            $table->json('attachments')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['gbv_case_id', 'note_type_id']);
            $table->index(['created_by', 'created_at']);
        });

        /* ==================== TIMELINES ==================== */
        Schema::create('case_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gbv_case_id')->constrained()->cascadeOnDelete();
            $table->foreignId('timeline_event_type_id')->constrained('timeline_event_types')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('happened_at')->useCurrent();
            $table->timestamps();

            $table->index(['gbv_case_id', 'timeline_event_type_id']);
            $table->index('happened_at');
        });
    }

    public function down(): void
    {
        foreach ([
            'case_timelines',
            'case_notes',
            'perpetrators',
            'referral_updates',
            'referrals',
            'case_files',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};