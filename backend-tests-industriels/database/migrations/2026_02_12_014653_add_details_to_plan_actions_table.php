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
        Schema::table('plan_actions', function (Blueprint $table) {
            $table->date('date_echeance')->nullable()->after('date_creation');
            $table->text('objectifs')->nullable()->after('statut_plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_actions', function (Blueprint $table) {
            $table->dropColumn(['date_echeance', 'objectifs']);
        });
    }
};
