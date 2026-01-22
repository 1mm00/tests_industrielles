<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_responsabilites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id');
            $table->string('code_responsabilite', 50);
            $table->string('libelle', 200);
            $table->text('description')->nullable();
            $table->string('domaine', 100)->nullable();
            $table->timestamps();
            
            $table->index('role_id');
            $table->index('code_responsabilite');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_responsabilites');
    }
};
