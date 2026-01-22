<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipements', function (Blueprint $table) {
            $table->uuid('id_equipement')->primary();
            $table->string('code_equipement', 50)->unique();
            $table->string('designation', 200);
            $table->string('fabricant', 100)->nullable();
            $table->string('modele', 100)->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->integer('annee_fabrication')->nullable();
            $table->date('date_mise_service')->nullable();
            $table->string('categorie_equipement', 100);
            $table->string('sous_categorie', 100)->nullable();
            $table->string('localisation_site', 200)->nullable();
            $table->string('localisation_precise', 200)->nullable();
            $table->decimal('puissance_nominale_kw', 10, 2)->nullable();
            $table->jsonb('caracteristiques_techniques')->nullable();
            $table->integer('niveau_criticite')->nullable();
            $table->string('statut_operationnel', 50)->default('EN_SERVICE');
            $table->uuid('proprietaire_id')->nullable();
            $table->uuid('responsable_id')->nullable();
            $table->date('date_dernier_test')->nullable();
            $table->date('date_prochain_test')->nullable();
            $table->timestamps();
            
            $table->index('code_equipement');
            $table->index('fabricant');
            $table->index('categorie_equipement');
            $table->index('statut_operationnel');
            $table->index('proprietaire_id');
            $table->index('responsable_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipements');
    }
};
