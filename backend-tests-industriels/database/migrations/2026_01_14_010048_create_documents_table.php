<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id_document')->primary();
            $table->string('code_document', 50)->unique();
            $table->string('titre', 300);
            $table->string('type_document', 100);
            $table->string('categorie', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('version', 20)->default('1.0');
            $table->date('date_creation');
            $table->uuid('auteur_id')->nullable();
            $table->string('statut', 50)->default('BROUILLON');
            $table->string('fichier_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('code_document');
            $table->index('type_document');
            $table->index('categorie');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
