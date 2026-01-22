<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultat_tests', function (Blueprint $table) {
            $table->uuid('id_resultat')->primary();
            $table->uuid('test_id');
            $table->string('type_resultat', 100);
            $table->string('resultat_global', 50);
            $table->decimal('taux_reussite_pct', 5, 2)->nullable();
            $table->integer('nombre_points_controle')->nullable();
            $table->integer('nombre_conformes')->nullable();
            $table->integer('nombre_non_conformes')->nullable();
            $table->text('synthese')->nullable();
            $table->text('recommandations')->nullable();
            $table->jsonb('details_resultats')->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('type_resultat');
            $table->index('resultat_global');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultat_tests');
    }
};
