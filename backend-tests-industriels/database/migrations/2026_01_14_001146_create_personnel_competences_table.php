<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel_competences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('personnel_id');
            $table->uuid('competence_id');
            $table->integer('niveau_maitrise')->nullable();
            $table->date('date_acquisition')->nullable();
            $table->date('date_derniere_evaluation')->nullable();
            $table->date('date_prochaine_evaluation')->nullable();
            $table->string('statut', 50)->default('VALIDE');
            $table->timestamps();
            
            $table->index('personnel_id');
            $table->index('competence_id');
            $table->unique(['personnel_id', 'competence_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel_competences');
    }
};
