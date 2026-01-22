<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendrier_obligatoires', function (Blueprint $table) {
            $table->uuid('id_calendrier')->primary();
            $table->uuid('equipement_id')->nullable();
            $table->uuid('type_test_id');
            $table->string('frequence', 50);
            $table->date('prochaine_echeance');
            $table->date('derniere_realisation')->nullable();
            $table->boolean('alerte_active')->default(true);
            $table->integer('jours_preavis')->default(30);
            $table->timestamps();
            
            $table->index('equipement_id');
            $table->index('type_test_id');
            $table->index('prochaine_echeance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendrier_obligatoires');
    }
};
