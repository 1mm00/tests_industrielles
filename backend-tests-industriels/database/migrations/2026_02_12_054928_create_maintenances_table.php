<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->uuid('id_maintenance')->primary();
            $table->uuid('equipement_id');
            $table->string('numero_intervention', 50)->unique();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type', ['PREVENTIVE', 'CURATIVE', 'CALIBRATION'])->default('PREVENTIVE');
            $table->enum('priorite', ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE'])->default('MOYENNE');
            $table->date('date_prevue');
            $table->date('date_realisation')->nullable();
            $table->uuid('technicien_id')->nullable();
            $table->enum('statut', ['PLANIFIEE', 'EN_COURS', 'REALISEE', 'ANNULEE'])->default('PLANIFIEE');
            $table->text('rapport_technique')->nullable();
            $table->decimal('cout_estime', 12, 2)->nullable();
            $table->decimal('cout_reel', 12, 2)->nullable();
            $table->json('pieces_changees')->nullable();
            $table->integer('periodicite_jours')->nullable(); // Pour la récurrence
            $table->timestamps();

            $table->foreign('equipement_id')->references('id_equipement')->on('equipements')->onDelete('cascade');
            $table->foreign('technicien_id')->references('id_personnel')->on('personnels')->onDelete('set null');

            $table->index('date_prevue');
            $table->index('statut');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
