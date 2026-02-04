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
        Schema::table('rapport_tests', function (Blueprint $table) {
            $table->string('titre_rapport', 255)->nullable()->after('type_rapport');
            $table->text('recommandations')->nullable()->after('titre_rapport');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapport_tests', function (Blueprint $table) {
            $table->dropColumn(['titre_rapport', 'recommandations']);
        });
    }
};
