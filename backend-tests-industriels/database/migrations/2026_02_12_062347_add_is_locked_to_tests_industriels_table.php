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
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->boolean('est_verrouille')->default(false)->after('statut_final');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests_industriels', function (Blueprint $table) {
            $table->dropColumn('est_verrouille');
        });
    }
};
