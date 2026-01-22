<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etape_procedures', function (Blueprint $table) {
            $table->uuid('id_etape')->primary();
            $table->uuid('procedure_id');
            $table->integer('numero_etape');
            $table->uuid('phase_id')->nullable();
            $table->string('titre', 300);
            $table->text('description');
            $table->integer('duree_estimee_minutes')->nullable();
            $table->text('equipements_requis')->nullable();
            $table->text('conditions_realisation')->nullable();
            $table->text('criteres_acceptation')->nullable();
            $table->text('risques_associes')->nullable();
            $table->text('mesures_securite')->nullable();
            $table->timestamps();
            
            $table->index('procedure_id');
            $table->index('phase_id');
            $table->unique(['procedure_id', 'numero_etape']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etape_procedures');
    }
};
