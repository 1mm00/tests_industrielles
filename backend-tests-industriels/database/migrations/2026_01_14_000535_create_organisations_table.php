<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organisations', function (Blueprint $table) {
            $table->uuid('id_organisation')->primary();
            $table->string('code_organisation', 50)->unique();
            $table->string('nom', 200);
            $table->string('type_organisation', 100);
            $table->string('siret', 14)->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('code_postal', 10)->nullable();
            $table->string('pays', 100)->default('France');
            $table->string('telephone', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
            
            $table->index('code_organisation');
            $table->index('type_organisation');
            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organisations');
    }
};
