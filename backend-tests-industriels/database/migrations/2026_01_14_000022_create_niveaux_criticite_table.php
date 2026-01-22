<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('niveaux_criticite', function (Blueprint $table) {
            $table->uuid('id_niveau_criticite')->primary();
            $table->string('code_niveau', 10)->unique();
            $table->string('libelle', 100);
            $table->text('description')->nullable();
            $table->integer('delai_traitement_max_heures');
            $table->string('couleur_indicateur', 7);
            $table->integer('ordre_affichage');
            
            $table->index('code_niveau');
            $table->index('ordre_affichage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('niveaux_criticite');
    }
};
