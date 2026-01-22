<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observation_tests', function (Blueprint $table) {
            $table->uuid('id_observation')->primary();
            $table->uuid('test_id');
            $table->uuid('session_id')->nullable();
            $table->timestamp('date_heure_observation');
            $table->uuid('observateur_id')->nullable();
            $table->string('type_observation', 100);
            $table->text('description');
            $table->string('niveau_severite', 50)->nullable();
            $table->jsonb('donnees_complementaires')->nullable();
            $table->timestamps();
            
            $table->index('test_id');
            $table->index('session_id');
            $table->index('observateur_id');
            $table->index('type_observation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observation_tests');
    }
};
