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
            $table->text('conclusions')->nullable()->after('description');
            $table->text('actions_correctives')->nullable()->after('conclusions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->dropColumn(['conclusions', 'actions_correctives']);
        });
    }
};
