<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instruments_mesure', function (Blueprint $table) {
            $table->uuid('id_instrument')->primary();
            $table->string('code_instrument', 50)->unique();
            $table->string('designation', 200);
            $table->string('type_instrument', 100);
            $table->string('categorie_mesure', 100);
            $table->string('fabricant', 100)->nullable();
            $table->string('modele', 100)->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->string('precision', 50)->nullable();
            $table->decimal('plage_mesure_min', 15, 4)->nullable();
            $table->decimal('plage_mesure_max', 15, 4)->nullable();
            $table->string('unite_mesure', 50);
            $table->decimal('resolution', 10, 4)->nullable();
            $table->date('date_acquisition')->nullable();
            $table->date('date_derniere_calibration')->nullable();
            $table->date('date_prochaine_calibration')->nullable();
            $table->integer('periodicite_calibration_mois')->nullable();
            $table->string('statut', 50)->default('OPERATIONNEL');
            $table->string('localisation', 200)->nullable();
            $table->string('certificat_calibration_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('code_instrument');
            $table->index('type_instrument');
            $table->index('statut');
            $table->index('date_prochaine_calibration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instruments_mesure');
    }
};
