<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapport_tests', function (Blueprint $table) {
            $table->uuid('id_rapport')->primary();
            $table->uuid('test_id');
            $table->string('numero_rapport', 50)->unique();
            $table->string('type_rapport', 100);
            $table->date('date_edition');
            $table->uuid('redacteur_id')->nullable();
            $table->uuid('valideur_id')->nullable();
            $table->date('date_validation')->nullable();
            $table->string('statut', 50)->default('BROUILLON');
            $table->text('resume_executif')->nullable();
            $table->jsonb('structure_rapport')->nullable();
            $table->string('fichier_pdf_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('numero_rapport');
            $table->index('type_rapport');
            $table->index('statut');
            $table->index('redacteur_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapport_tests');
    }
};
