<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('postes', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 200)->unique();
            $table->string('categorie', 50); // Technique, Gestion, Administratif
            $table->string('niveau_requis', 50)->nullable(); // BTS/DUT, Licence, Ingénieur, etc.
            $table->text('description')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('categorie');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postes');
    }
};
