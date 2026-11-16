<?php

use App\Http\Controllers\CaseNoteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GbvCaseController;
use App\Http\Controllers\GbvCaseFileController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PerpetratorController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\Settings\AgeRangeController;
use App\Http\Controllers\Settings\CaseStatusOptionController;
use App\Http\Controllers\Settings\ConclusionTypeController;
use App\Http\Controllers\Settings\ConfidentialityLevelController;
use App\Http\Controllers\Settings\CountyController;
use App\Http\Controllers\Settings\DisabilityTypeController;
use App\Http\Controllers\Settings\FileTypeController;
use App\Http\Controllers\Settings\GenderOptionController;
use App\Http\Controllers\Settings\IdTypeController;
use App\Http\Controllers\Settings\IncidentTypeController;
use App\Http\Controllers\Settings\NoteTypeController;
use App\Http\Controllers\Settings\OrganizationTypeController;
use App\Http\Controllers\Settings\PriorityLevelController;
use App\Http\Controllers\Settings\ReferralTypeController;
use App\Http\Controllers\Settings\RelationshipOptionController;
use App\Http\Controllers\Settings\SubCountyController;
use App\Http\Controllers\Settings\TimelineEventTypeController;
use App\Http\Controllers\Settings\UrgencyOptionController;
use App\Http\Controllers\Settings\VillageController;
use App\Http\Controllers\Settings\WardController;
use App\Http\Controllers\SurvivorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/privacy-policy', 'privacy-policy')->name('privacy-policy');
Route::inertia('/terms-and-conditions', 'terms-and-conditions')->name('terms-and-conditions');

Route::middleware(['auth', 'verified'])->group(function () {
    /*
    |-----------------------------------------------------------------------
    | Dashboard
    |-----------------------------------------------------------------------
    */

    Route::prefix('dashboard')->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('/live', [DashboardController::class, 'live'])->name('dashboard.live');
    });

    /*
    |-----------------------------------------------------------------------
    | Resource Routes (CRUD Operations)
    |-----------------------------------------------------------------------
    */

    Route::resources([
        'partners' => PartnerController::class,
        'survivors' => SurvivorController::class,
        'gbv-cases' => GbvCaseController::class,
        'referrals' => ReferralController::class,
    ]);

    Route::prefix('partners')->name('partners.')->group(function () {
        Route::post('/{partner}/verify', [PartnerController::class, 'verify'])
            ->name('verify');
        Route::get('/{partner}/print', [PartnerController::class, 'print'])
            ->name('print');
        Route::post('{partner}/restore', [PartnerController::class, 'restore'])
            ->name('restore')
            ->withTrashed();
        Route::get('/export/excel', [PartnerController::class, 'exportExcel'])
            ->name('export.excel');
        Route::get('/export/pdf', [PartnerController::class, 'exportPdf'])
            ->name('export.pdf');
    });

    Route::prefix('survivors')->name('survivors.')->group(function () {
        Route::get('/{survivor}/print', [SurvivorController::class, 'print'])
            ->name('print');
        Route::get('/{survivor}/card', [SurvivorController::class, 'printCard'])
            ->name('card');
        Route::post('{survivor}/restore', [SurvivorController::class, 'restore'])
            ->name('restore')
            ->withTrashed();
        Route::get('/export/excel', [SurvivorController::class, 'exportExcel'])
            ->name('export.excel');
        Route::get('/export/pdf', [SurvivorController::class, 'exportPdf'])
            ->name('export.pdf');
    });

    Route::prefix('gbv-cases')->name('gbv-cases.')->group(function () {
        // Gbv Cases
        Route::post('{gbvCase}/restore', [GbvCaseController::class, 'restore'])
            ->name('restore')
            ->withTrashed();
        Route::get('/{gbvCase}/print', [GbvCaseController::class, 'print'])
            ->name('print');
        Route::get('/export/excel', [GbvCaseController::class, 'exportExcel'])
            ->name('export.excel');
        Route::get('/export/pdf', [GbvCaseController::class, 'exportPdf'])
            ->name('export.pdf');

        // Files
        Route::get('/{gbvCase}/files/{file}', [GbvCaseFileController::class, 'download'])
            ->name('files.download');
        Route::post('/{gbvCase}/files', [GbvCaseFileController::class, 'store'])
            ->name('files.store');
        Route::delete('/{gbvCase}/files/{file}', [GbvCaseFileController::class, 'destroy'])
            ->name('files.destroy');

        // Perpetrators
        Route::post('/{gbvCase}/perpetrators', [PerpetratorController::class, 'store'])
            ->name('perpetrators.store');
        Route::put('/{gbvCase}/perpetrators/{perpetrator}', [PerpetratorController::class, 'update'])
            ->name('perpetrators.update');
        Route::delete('/{gbvCase}/perpetrators/{perpetrator}', [PerpetratorController::class, 'destroy'])
            ->name('perpetrators.destroy');

        // Referrals
        Route::post('/{gbvCase}/referrals', [ReferralController::class, 'store'])
            ->name('referrals.store');
        Route::put('/{gbvCase}/referrals/{referral}', [ReferralController::class, 'update'])
            ->name('referrals.update');
        Route::delete('/{gbvCase}/referrals/{referral}', [ReferralController::class, 'destroy'])
            ->name('referrals.destroy');

        // Notes
        Route::post('/{gbvCase}/notes', [CaseNoteController::class, 'store'])
            ->name('notes.store');
        Route::put('/{gbvCase}/notes/{note}', [CaseNoteController::class, 'update'])
            ->name('notes.update');
        Route::delete('/{gbvCase}/notes/{note}', [CaseNoteController::class, 'destroy'])
            ->name('notes.destroy');
    });

    // System Settings
    Route::prefix('system-settings')->name('system-settings.')->group(function () {
        Route::resources([
            // Locations
            'counties' => CountyController::class,
            'sub-counties' => SubCountyController::class,
            'wards' => WardController::class,
            'villages' => VillageController::class,

            // Incident / Case
            'incident-types' => IncidentTypeController::class,
            'priority-levels' => PriorityLevelController::class,
            'confidentiality-levels' => ConfidentialityLevelController::class,
            'case-statuses' => CaseStatusOptionController::class,
            'conclusion-types' => ConclusionTypeController::class,
            'timeline-event-types' => TimelineEventTypeController::class,

            // Referral
            'referral-types' => ReferralTypeController::class,
            'urgency-options' => UrgencyOptionController::class,

            // Person / Demographic
            'id-types' => IdTypeController::class,
            'disability-types' => DisabilityTypeController::class,
            'age-ranges' => AgeRangeController::class,
            'gender-options' => GenderOptionController::class,
            'relationship-options' => RelationshipOptionController::class,

            // Files / Notes
            'file-types' => FileTypeController::class,
            'note-types' => NoteTypeController::class,

            // Organization
            'organization-types' => OrganizationTypeController::class,
        ]);
    });
});

require __DIR__ . '/settings.php';