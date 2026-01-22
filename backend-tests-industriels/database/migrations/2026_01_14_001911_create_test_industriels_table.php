<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests_industriels', function (Blueprint $table) {
            // Primary Key
            $table->uuid('id_test')->primary();
            
            // Informations test
            $table->string('numero_test', 50)->unique();
            $table->uuid('type_test_id')->nullable();
            $table->uuid('equipement_id')->nullable();
            $table->uuid('phase_id')->nullable();
            $table->uuid('procedure_id')->nullable();
            
            // Dates et heures
            $table->date('date_test')->nullable();
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->decimal('duree_reelle_heures', 8, 2)->nullable();
            
            // Localisation et conditions
            $table->string('localisation', 200)->nullable();
            $table->jsonb('conditions_environnementales')->nullable();
            
            // Criticité et statut
            $table->integer('niveau_criticite')->nullable();
            $table->string('statut_test', 50)->default('PLANIFIE');
            $table->string('resultat_global', 50)->nullable();
            $table->decimal('taux_conformite_pct', 5, 2)->nullable();
            
            // Responsabilité
            $table->uuid('responsable_test_id')->nullable();
            $table->jsonb('equipe_test')->nullable();
            
            // Observations
            $table->text('observations_generales')->nullable();
            $table->text('incidents_signales')->nullable();
            
            // Production
            $table->boolean('arret_production_requis')->default(false);
            $table->decimal('duree_arret_heures', 8, 2)->nullable();
            
            // Audit
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('numero_test');
            $table->index('type_test_id');
            $table->index('equipement_id');
            $table->index('phase_id');
            $table->index('date_test');
            $table->index('statut_test');
            $table->index('responsable_test_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests_industriels');
    }
};
