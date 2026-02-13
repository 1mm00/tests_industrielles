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
        Schema::table('mesures', function (Blueprint $table) {
            $table->string('incertitude_mesure', 100)->nullable()->change();
            $table->text('conditions_mesure')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mesures', function (Blueprint $table) {
            $table->decimal('incertitude_mesure', 10, 4)->nullable()->change();
            $table->jsonb('conditions_mesure')->nullable()->change();
        });
    }
};
