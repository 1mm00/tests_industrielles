<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('types_tests', function (Blueprint $table) {
            $table->uuid('id_type_test')->primary();
            $table->string('code_type', 20)->unique();
            $table->string('libelle', 100);
            $table->string('categorie_principale', 100)->nullable();
            $table->string('sous_categorie', 100)->nullable();
            $table->text('description')->nullable();
            $table->integer('niveau_criticite_defaut')->nullable();
            $table->decimal('duree_estimee_jours', 8, 2)->nullable();
            $table->string('frequence_recommandee', 100)->nullable();
            $table->boolean('actif')->default(true);
            
            $table->index('code_type');
            $table->index('categorie_principale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('types_tests');
    }
};
