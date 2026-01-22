<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jalons', function (Blueprint $table) {
            $table->uuid('id_jalon')->primary();
            $table->uuid('test_id');
            $table->string('nom_jalon', 200);
            $table->text('description')->nullable();
            $table->date('date_prevue');
            $table->date('date_realisee')->nullable();
            $table->string('statut', 50)->default('A_VENIR');
            $table->uuid('responsable_id')->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('date_prevue');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jalons');
    }  
};
