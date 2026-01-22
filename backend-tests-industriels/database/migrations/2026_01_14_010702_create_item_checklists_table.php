<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_checklists', function (Blueprint $table) {
            $table->uuid('id_item')->primary();
            $table->uuid('checklist_id');
            $table->integer('numero_item');
            $table->string('libelle', 500);
            $table->string('categorie', 100)->nullable();
            $table->string('type_verif', 50);
            $table->text('critere_acceptation')->nullable();
            $table->string('valeur_reference', 200)->nullable();
            $table->string('tolerance', 100)->nullable();
            $table->boolean('obligatoire')->default(true);
            $table->integer('criticite')->nullable();
            $table->timestamps();
            
            $table->index('checklist_id');
            $table->index('type_verif');
            $table->unique(['checklist_id', 'numero_item']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_checklists');
    }
};
