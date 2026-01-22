<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('methodologies_tests', function (Blueprint $table) {
            $table->uuid('id_methodologie')->primary();
            $table->string('code_methodologie', 50)->unique();
            $table->string('nom', 200);
            $table->text('description')->nullable();
            $table->string('domaine_application', 100)->nullable();
            $table->text('etapes_principales')->nullable();
            $table->jsonb('parametres_configuration')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('code_methodologie');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('methodologies_tests');
    }
};
