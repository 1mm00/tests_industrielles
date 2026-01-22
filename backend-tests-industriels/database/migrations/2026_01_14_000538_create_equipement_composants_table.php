<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipement_composants', function (Blueprint $table) {
            $table->uuid('id_composant')->primary();
            $table->uuid('equipement_id');
            $table->string('code_composant', 50);
            $table->string('designation', 300);
            $table->string('type_composant', 100);
            $table->string('fabricant', 200)->nullable();
            $table->string('reference_fabricant', 100)->nullable();
            $table->date('date_installation')->nullable();
            $table->integer('duree_vie_prevue_heures')->nullable();
            $table->integer('niveau_criticite')->nullable();
            $table->string('statut', 50)->default('Opérationnel');
            $table->timestamps();
            
            $table->index('equipement_id');
            $table->index('type_composant');
            $table->index('statut');
            $table->unique(['equipement_id', 'code_composant']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipement_composants');
    }
};
