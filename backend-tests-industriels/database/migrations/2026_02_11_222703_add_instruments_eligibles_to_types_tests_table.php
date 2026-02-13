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
        Schema::table('types_tests', function (Blueprint $table) {
            $table->jsonb('instruments_eligibles')->nullable()->after('equipements_eligibles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('types_tests', function (Blueprint $table) {
            $table->dropColumn('instruments_eligibles');
        });
    }
};
