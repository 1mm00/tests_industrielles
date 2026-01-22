<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mesures', function (Blueprint $table) {
            $table->uuid('id_mesure')->primary();
            $table->uuid('session_id')->nullable();
            $table->uuid('test_id')->nullable();
            $table->uuid('instrument_id')->nullable();
            $table->string('type_mesure', 100);
            $table->string('parametre_mesure', 200);
            $table->decimal('valeur_mesuree', 15, 4);
            $table->string('unite_mesure', 50);
            $table->decimal('valeur_reference', 15, 4)->nullable();
            $table->decimal('tolerance_min', 15, 4)->nullable();
            $table->decimal('tolerance_max', 15, 4)->nullable();
            $table->decimal('ecart_absolu', 15, 4)->nullable();
            $table->decimal('ecart_pct', 10, 2)->nullable();
            $table->boolean('conforme')->default(true);
            $table->decimal('incertitude_mesure', 10, 4)->nullable();
            $table->timestamp('timestamp_mesure')->nullable();
            $table->jsonb('conditions_mesure')->nullable();
            $table->uuid('operateur_id')->nullable();
            
            $table->index('test_id');
            $table->index('session_id');
            $table->index('instrument_id');
            $table->index('conforme');
            $table->index('operateur_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mesures');
    }
};
