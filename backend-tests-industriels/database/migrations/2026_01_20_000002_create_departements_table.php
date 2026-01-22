<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departements', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 200)->unique();
            $table->string('categorie', 50); // Technique, Qualité, Support, Direction, etc.
            $table->string('site', 100)->nullable(); // Siège, Site Marignane, Site Istres
            $table->text('description')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('categorie');
            $table->index('site');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departements');
    }
};
