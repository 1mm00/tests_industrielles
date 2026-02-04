<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            // Instrument utilisé pour le test
            $table->uuid('instrument_id')->nullable()->after('procedure_id');
            
            // Statut final du test (OK/NOK)
            $table->string('statut_final', 10)->nullable()->after('resultat_global')
                ->comment('Résultat final: OK (conforme) ou NOK (non conforme)');
            
            // Résultat attendu pour comparaison
            $table->text('resultat_attendu')->nullable()->after('statut_final')
                ->comment('Résultat attendu pour comparer avec le résultat réel');
            
            // Index pour optimisation
            $table->index('instrument_id');
            $table->index('statut_final');
        });
    }

    public function down(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->dropIndex(['instrument_id']);
            $table->dropIndex(['statut_final']);
            $table->dropColumn(['instrument_id', 'statut_final', 'resultat_attendu']);
        });
    }
};
