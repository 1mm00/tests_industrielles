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
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->jsonb('co_detecteurs')->nullable()->after('detecteur_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->dropColumn('co_detecteurs');
        });
    }

};
