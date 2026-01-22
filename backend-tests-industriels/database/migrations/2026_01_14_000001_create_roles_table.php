<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id_role')->primary();
            $table->string('nom_role', 50)->unique();
            $table->text('description')->nullable();
            $table->integer('niveau_acces');
            $table->jsonb('permissions')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('nom_role');
            $table->index('niveau_acces');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
