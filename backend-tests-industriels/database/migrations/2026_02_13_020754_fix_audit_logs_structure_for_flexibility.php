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
        Schema::table('audit_logs', function (Blueprint $table) {
            // Dans PostgreSQL, changer un type UUID vers String nécessite un 'USING' clause,
            // mais Laravel ne le gère pas nativement dans Blueprint. 
            // On va donc supprimer et recréer les colonnes pour une flexibilité maximale.
            
            $table->dropColumn(['user_id', 'auditable_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('user_id')->nullable()->after('id');
            $table->string('auditable_id')->after('auditable_type');
            
            // Recréer les index
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'auditable_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->after('id');
            $table->uuid('auditable_id')->after('auditable_type');
            
            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
        });
    }
};
