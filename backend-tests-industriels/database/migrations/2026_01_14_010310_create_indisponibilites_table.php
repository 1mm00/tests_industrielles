<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indisponibilites', function (Blueprint $table) {
            $table->uuid('id_indisponibilite')->primary();
            $table->uuid('equipement_id')->nullable();
            $table->uuid('personnel_id')->nullable();
            $table->timestamp('date_debut');
            $table->timestamp('date_fin')->nullable();
            $table->string('type_indisponibilite', 100);
            $table->text('motif')->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            $table->index('equipement_id');
            $table->index('personnel_id');
            $table->index('date_debut');
            $table->index('type_indisponibilite');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indisponibilites');
    }
};
