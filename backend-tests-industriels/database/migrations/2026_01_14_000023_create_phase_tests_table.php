<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phases_tests', function (Blueprint $table) {
            $table->uuid('id_phase')->primary();
            $table->string('code_phase', 20)->unique();
            $table->string('nom_phase', 100);
            $table->text('description')->nullable();
            $table->integer('ordre_execution');
            $table->integer('duree_estimee_heures')->nullable();
            $table->boolean('obligatoire')->default(true);
            
            $table->index('code_phase');
            $table->index('ordre_execution');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phases_tests');
    }
};
