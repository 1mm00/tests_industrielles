<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories_tests', function (Blueprint $table) {
            $table->uuid('id_categorie')->primary();
            $table->string('code_categorie', 50)->unique();
            $table->string('libelle', 200);
            $table->uuid('categorie_parent_id')->nullable();
            $table->integer('niveau_hierarchie');
            $table->integer('ordre_affichage')->nullable();
            $table->text('description')->nullable();
            
            $table->index('categorie_parent_id');
            $table->index('niveau_hierarchie');
            $table->index('code_categorie');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories_tests');
    }
};
