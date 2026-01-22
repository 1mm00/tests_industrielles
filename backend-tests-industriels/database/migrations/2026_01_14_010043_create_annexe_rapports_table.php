<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annexe_rapports', function (Blueprint $table) {
            $table->uuid('id_annexe')->primary();
            $table->uuid('rapport_id');
            $table->string('numero_annexe', 20);
            $table->string('titre', 300);
            $table->string('type_annexe', 100);
            $table->text('description')->nullable();
            $table->string('fichier_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('rapport_id');
            $table->index('type_annexe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annexe_rapports');
    }
};
