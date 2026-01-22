<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Mesure;
use App\Observers\MesureObserver;

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
        // Enregistrer Observer pour calculs automatiques
        Mesure::observe(MesureObserver::class);
    }
}
