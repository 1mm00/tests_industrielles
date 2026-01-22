<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cause_racines', function (Blueprint $table) {
            $table->uuid('id_cause')->primary();
            $table->uuid('non_conformite_id');
            $table->string('type_cause', 100);
            $table->text('description');
            $table->string('categorie', 100)->nullable();
            $table->text('analyse_5_pourquoi')->nullable();
            $table->decimal('probabilite_recurrence_pct', 5, 2)->nullable();
            $table->timestamps();
            
            $table->index('non_conformite_id');
            $table->index('type_cause');
            $table->index('categorie');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cause_racines');
    }
};
