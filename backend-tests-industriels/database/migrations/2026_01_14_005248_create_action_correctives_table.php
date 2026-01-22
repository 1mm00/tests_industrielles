<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('action_correctives', function (Blueprint $table) {
            $table->uuid('id_action')->primary();
            $table->uuid('non_conformite_id');
            $table->uuid('cause_racine_id')->nullable();
            $table->string('numero_action', 50)->unique();
            $table->string('type_action', 100);
            $table->text('description');
            $table->uuid('responsable_id')->nullable();
            $table->date('date_prevue');
            $table->date('date_realisee')->nullable();
            $table->string('statut', 50)->default('PLANIFIEE');
            $table->decimal('cout_estime_eur', 10, 2)->nullable();
            $table->decimal('cout_reel_eur', 10, 2)->nullable();
            $table->text('commentaires')->nullable();
            $table->timestamps();
            
            $table->index('non_conformite_id');
            $table->index('cause_racine_id');
            $table->index('numero_action');
            $table->index('responsable_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('action_correctives');
    }
};
