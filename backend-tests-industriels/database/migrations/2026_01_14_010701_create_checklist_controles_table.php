<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_controles', function (Blueprint $table) {
            $table->uuid('id_checklist')->primary();
            $table->string('code_checklist', 50)->unique();
            $table->string('titre', 300);
            $table->uuid('type_test_id')->nullable();
            $table->string('version', 20);
            $table->string('statut', 20)->default('Actif');
            $table->timestamps();
            
            $table->index('code_checklist');
            $table->index('type_test_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_controles');
    }
};
