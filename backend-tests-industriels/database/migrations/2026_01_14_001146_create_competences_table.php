<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competences', function (Blueprint $table) {
            $table->uuid('id_competence')->primary();
            $table->string('code_competence', 50)->unique();
            $table->string('nom_competence', 200);
            $table->text('description')->nullable();
            $table->string('categorie', 100)->nullable();
            $table->integer('niveau_requis')->nullable();
            $table->boolean('certification_requise')->default(false);
            $table->timestamps();
            
            $table->index('code_competence');
            $table->index('categorie');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competences');
    }
};
