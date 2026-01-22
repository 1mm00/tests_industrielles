<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_efficacites', function (Blueprint $table) {
            $table->uuid('id_verification')->primary();
            $table->uuid('action_corrective_id');
            $table->date('date_verification');
            $table->uuid('verificateur_id')->nullable();
            $table->string('methode_verification', 200);
            $table->text('resultats_verification');
            $table->boolean('efficace');
            $table->text('commentaires')->nullable();
            $table->timestamps();
            
            $table->index('action_corrective_id');
            $table->index('date_verification');
            $table->index('verificateur_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_efficacites');
    }
};
