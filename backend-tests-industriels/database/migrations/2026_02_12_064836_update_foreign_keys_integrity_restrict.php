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
        // 1. Tests Industriels - Add constraints
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->foreign('equipement_id')->references('id_equipement')->on('equipements')->onDelete('restrict');
            $table->foreign('type_test_id')->references('id_type_test')->on('types_tests')->onDelete('restrict');
            $table->foreign('responsable_test_id')->references('id_personnel')->on('personnels')->onDelete('restrict');
        });

        // 2. Non Conformités - Add constraints
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->foreign('equipement_id')->references('id_equipement')->on('equipements')->onDelete('restrict');
            $table->foreign('test_id')->references('id_test')->on('tests_industriels')->onDelete('restrict');
        });

        // 3. Maintenances - Update from CASCADE to RESTRICT
        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropForeign(['equipement_id']);
            $table->foreign('equipement_id')->references('id_equipement')->on('equipements')->onDelete('restrict');
        });

        // 4. Mesures - Add constraints
        Schema::table('mesures', function (Blueprint $table) {
            $table->foreign('test_id')->references('id_test')->on('tests_industriels')->onDelete('restrict');
        });

        // 5. Calibrations - Add constraints (Fixed table name: instruments_mesure)
        Schema::table('calibration_instruments', function (Blueprint $table) {
            $table->foreign('instrument_id')->references('id_instrument')->on('instruments_mesure')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->dropForeign(['equipement_id']);
            $table->dropForeign(['type_test_id']);
            $table->dropForeign(['responsable_test_id']);
        });

        Schema::table('non_conformites', function (Blueprint $table) {
            $table->dropForeign(['equipement_id']);
            $table->dropForeign(['test_id']);
        });

        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropForeign(['equipement_id']);
            $table->foreign('equipement_id')->references('id_equipement')->on('equipements')->onDelete('cascade');
        });

        Schema::table('mesures', function (Blueprint $table) {
            $table->dropForeign(['test_id']);
        });

        Schema::table('calibration_instruments', function (Blueprint $table) {
            $table->dropForeign(['instrument_id']);
        });
    }
};
