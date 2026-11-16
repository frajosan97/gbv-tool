<?php

namespace App\Providers;

use App\Models\CaseNote;
use App\Models\GbvCase;
use App\Models\Partner;
use App\Models\Perpetrator;
use App\Models\Referral;
use App\Models\Survivor;
use App\Policies\CaseNotePolicy;
use App\Policies\GbvCasePolicy;
use App\Policies\PartnerPolicy;
use App\Policies\PerpetratorPolicy;
use App\Policies\ReferralPolicy;
use App\Policies\SurvivorPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerPolicies();
    }

    /**
     * Register the application's policies.
     */
    protected function registerPolicies(): void
    {
        Gate::policy(CaseNote::class, CaseNotePolicy::class);
        Gate::policy(GbvCase::class, GbvCasePolicy::class);
        Gate::policy(Partner::class, PartnerPolicy::class);
        Gate::policy(Perpetrator::class, PerpetratorPolicy::class);
        Gate::policy(Referral::class, ReferralPolicy::class);
        Gate::policy(Survivor::class, SurvivorPolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
