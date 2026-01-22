<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('valeur_kpis', function (Blueprint $table) {
            $table->uuid('id_valeur')->primary();
            $table->uuid('kpi_id');
            $table->date('periode_debut');
            $table->date('periode_fin');
            $table->decimal('valeur', 15, 2);
            $table->string('statut', 50)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
            
            $table->index('kpi_id');
            $table->index('periode_debut');
            $table->index('periode_fin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('valeur_kpis');
    }
};
