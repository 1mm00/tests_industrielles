<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procedure_tests', function (Blueprint $table) {
            $table->uuid('id_procedure')->primary();
            $table->string('code_procedure', 50)->unique();
            $table->string('titre', 300);
            $table->uuid('type_test_id')->nullable();
            $table->string('version', 20)->default('1.0');
            $table->date('date_creation');
            $table->uuid('auteur_id')->nullable();
            $table->uuid('validateur_id')->nullable();
            $table->date('date_validation')->nullable();
            $table->string('statut', 50)->default('BROUILLON');
            $table->text('objectif')->nullable();
            $table->text('domaine_application')->nullable();
            $table->jsonb('equipements_requis')->nullable();
            $table->text('precautions_securite')->nullable();
            $table->timestamps();
            
            $table->index('code_procedure');
            $table->index('type_test_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procedure_tests');
    }
};
