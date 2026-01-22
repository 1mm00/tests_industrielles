<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calibration_instruments', function (Blueprint $table) {
            $table->uuid('id_calibration')->primary();
            $table->uuid('instrument_id');
            $table->string('numero_certificat', 100)->unique();
            $table->date('date_calibration');
            $table->uuid('organisme_calibration_id')->nullable();
            $table->string('methode_calibration', 200)->nullable();
            $table->string('norme_reference', 100)->nullable();
            $table->string('etalon_reference', 200)->nullable();
            $table->string('incertitude_mesure', 100)->nullable();
            $table->string('resultat_calibration', 50);
            $table->jsonb('ecarts_mesures')->nullable();
            $table->date('date_prochaine_calibration');
            $table->uuid('technicien_id')->nullable();
            $table->text('observations')->nullable();
            $table->string('certificat_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('instrument_id');
            $table->index('numero_certificat');
            $table->index('date_calibration');
            $table->index('date_prochaine_calibration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calibration_instruments');
    }
};
