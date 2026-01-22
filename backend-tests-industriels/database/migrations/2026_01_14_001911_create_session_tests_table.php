<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_tests', function (Blueprint $table) {
            $table->uuid('id_session')->primary();
            $table->uuid('test_id');
            $table->string('numero_session', 50)->unique();
            $table->timestamp('date_heure_debut');
            $table->timestamp('date_heure_fin')->nullable();
            $table->integer('duree_minutes')->nullable();
            $table->uuid('responsable_id')->nullable();
            $table->jsonb('equipe')->nullable();
            $table->string('statut', 50)->default('EN_COURS');
            $table->text('observations')->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('numero_session');
            $table->index('statut');
            $table->index('responsable_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_tests');
    }
};
