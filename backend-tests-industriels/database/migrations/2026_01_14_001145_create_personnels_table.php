<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnels', function (Blueprint $table) {
            $table->uuid('id_personnel')->primary();
            $table->string('matricule', 50)->unique();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->string('email', 150)->unique();
            $table->string('telephone', 20)->nullable();
            $table->string('poste', 100);
            $table->string('departement', 100)->nullable();
            $table->uuid('role_id')->nullable();
            $table->date('date_embauche')->nullable();
            $table->boolean('actif')->default(true);
            $table->jsonb('habilitations')->nullable();
            $table->timestamps();
            
            $table->index('matricule');
            $table->index('email');
            $table->index('role_id');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};
