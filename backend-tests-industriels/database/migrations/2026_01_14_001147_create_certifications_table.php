<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certifications', function (Blueprint $table) {
            $table->uuid('id_certification')->primary();
            $table->uuid('personnel_id');
            $table->string('type_certification', 100);
            $table->string('organisme_delivrance', 200);
            $table->string('numero_certification', 100)->nullable();
            $table->date('date_obtention');
            $table->date('date_expiration')->nullable();
            $table->string('statut', 50)->default('VALIDE');
            $table->string('document_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('personnel_id');
            $table->index('type_certification');
            $table->index('statut');
            $table->index('date_expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certifications');
    }
};
