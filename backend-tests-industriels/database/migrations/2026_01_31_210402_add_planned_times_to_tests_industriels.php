<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->time('heure_debut_planifiee')->nullable()->after('heure_fin');
            $table->time('heure_fin_planifiee')->nullable()->after('heure_debut_planifiee');
        });
    }

    public function down(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->dropColumn(['heure_debut_planifiee', 'heure_fin_planifiee']);
        });
    }
};
