<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificats', function (Blueprint $table) {
            $table->uuid('id_certificat')->primary();
            $table->string('numero_certificat', 100)->unique();
            $table->string('type_certificat', 100);
            $table->uuid('equipement_id')->nullable();
            $table->uuid('instrument_id')->nullable();
            $table->uuid('organisme_delivrance_id')->nullable();
            $table->date('date_emission');
            $table->date('date_expiration')->nullable();
            $table->string('statut', 50)->default('VALIDE');
            $table->string('fichier_url', 500)->nullable();
            $table->timestamps();
            
            $table->index('numero_certificat');
            $table->index('type_certificat');
            $table->index('equipement_id');
            $table->index('instrument_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificats');
    }
};
