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
        // 1. Ajouter le champ metadata/snapshot à la table non_conformites
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->json('context_environnemental')->nullable()->after('impact_potentiel');
        });

        // 2. Ajouter plan_id à action_correctives pour lier les actions au Plan
        Schema::table('action_correctives', function (Blueprint $table) {
            $table->uuid('plan_id')->nullable()->after('non_conformite_id');
            $table->index('plan_id');
        });

        // Migration de données : Lier les actions existantes aux plans si possible
        // (Optionnel selon si la base est vide ou non)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('non_conformites', function (Blueprint $table) {
            $table->dropColumn('context_environnemental');
        });

        Schema::table('action_correctives', function (Blueprint $table) {
            $table->dropColumn('plan_id');
        });
    }
};
