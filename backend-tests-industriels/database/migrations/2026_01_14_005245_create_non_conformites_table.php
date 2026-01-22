<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('non_conformites', function (Blueprint $table) {
            $table->uuid('id_non_conformite')->primary();
            $table->string('numero_nc', 50)->unique();
            $table->uuid('test_id')->nullable();
            $table->uuid('mesure_id')->nullable();
            $table->uuid('equipement_id')->nullable();
            $table->uuid('criticite_id')->nullable();
            $table->string('type_nc', 100);
            $table->text('description');
            $table->text('impact_potentiel')->nullable();
            $table->date('date_detection');
            $table->uuid('detecteur_id')->nullable();
            $table->string('statut', 50)->default('OUVERTE');
            $table->date('date_cloture')->nullable();
            $table->uuid('valideur_cloture_id')->nullable();
            $table->text('commentaires_cloture')->nullable();
            $table->timestamps();
            
            $table->index('numero_nc');
            $table->index('test_id');
            $table->index('mesure_id');
            $table->index('equipement_id');
            $table->index('criticite_id');
            $table->index('statut');
            $table->index('date_detection');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('non_conformites');
    }
};
