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
            $table->uuid('item_id')->nullable()->after('test_id');
            $table->integer('criticite')->nullable()->after('item_id')->default(1);
            
            $table->index('item_id');
            $table->index('criticite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mesures', function (Blueprint $table) {
            $table->dropIndex(['item_id']);
            $table->dropIndex(['criticite']);
            $table->dropColumn(['item_id', 'criticite']);
        });
    }
};
