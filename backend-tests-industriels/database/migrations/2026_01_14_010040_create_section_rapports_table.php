<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_rapports', function (Blueprint $table) {
            $table->uuid('id_section')->primary();
            $table->uuid('rapport_id');
            $table->string('numero_section', 20);
            $table->string('titre', 300);
            $table->integer('ordre_affichage');
            $table->text('contenu')->nullable();
            $table->jsonb('tableaux_donnees')->nullable();
            $table->timestamps();
            
            $table->index('rapport_id');
            $table->index('ordre_affichage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_rapports');
    }
};
