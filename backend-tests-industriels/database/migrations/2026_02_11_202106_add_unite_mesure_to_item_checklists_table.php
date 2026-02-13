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
        Schema::table('item_checklists', function (Blueprint $table) {
            $table->string('unite_mesure')->nullable()->after('valeur_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_checklists', function (Blueprint $table) {
            $table->dropColumn('unite_mesure');
        });
    }
};
