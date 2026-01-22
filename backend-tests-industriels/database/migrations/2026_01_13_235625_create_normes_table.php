<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('normes', function (Blueprint $table) {
            $table->uuid('id_norme')->primary();
            $table->string('code_norme', 50)->unique();
            $table->string('titre', 500);
            $table->string('organisme_emission', 100);
            $table->string('categorie', 50);
            $table->string('version', 20);
            $table->date('date_publication')->nullable();
            $table->date('date_derniere_revision')->nullable();
            $table->enum('statut', ['Actif', 'Obsolète', 'En révision'])->default('Actif');
            $table->string('url_reference', 500)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index('code_norme');
            $table->index('organisme_emission');
            $table->index('categorie');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('normes');
    }
};
