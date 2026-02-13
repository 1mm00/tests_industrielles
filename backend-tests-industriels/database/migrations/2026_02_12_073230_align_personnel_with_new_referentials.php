<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Transformation de la table departements (vers UUID et structure industrielle)
        Schema::table('departements', function (Blueprint $table) {
            // Ajouter temporairement les nouvelles colonnes
            $table->uuid('id_departement_new')->nullable();
            $table->string('code_departement', 20)->nullable();
            $table->uuid('responsable_id')->nullable();
        });

        // Initialiser les UUID pour les données existantes
        DB::table('departements')->get()->each(function ($item) {
            DB::table('departements')->where('id', $item->id)->update([
                'id_departement_new' => (string) \Illuminate\Support\Str::uuid(),
                'code_departement' => 'DEPT-' . $item->id
            ]);
        });

        Schema::table('departements', function (Blueprint $table) {
            $table->dropColumn('id');
            $table->dropColumn(['categorie', 'site']);
        });

        Schema::table('departements', function (Blueprint $table) {
            $table->renameColumn('id_departement_new', 'id_departement');
        });

        Schema::table('departements', function (Blueprint $table) {
            $table->primary('id_departement');
            $table->string('code_departement', 20)->unique()->change();
        });

        // 2. Transformation de la table postes (vers UUID et structure industrielle)
        Schema::table('postes', function (Blueprint $table) {
            $table->uuid('id_poste_new')->nullable();
            $table->string('code_poste', 20)->nullable();
            $table->uuid('role_id')->nullable();
        });

        DB::table('postes')->get()->each(function ($item) {
            DB::table('postes')->where('id', $item->id)->update([
                'id_poste_new' => (string) \Illuminate\Support\Str::uuid(),
                'code_poste' => 'POSTE-' . $item->id
            ]);
        });

        Schema::table('postes', function (Blueprint $table) {
            $table->dropColumn('id');
            $table->dropColumn('niveau_requis');
        });

        Schema::table('postes', function (Blueprint $table) {
            $table->renameColumn('id_poste_new', 'id_poste');
        });

        Schema::table('postes', function (Blueprint $table) {
            $table->primary('id_poste');
            $table->string('code_poste', 20)->unique()->change();
        });

        // 3. Mise à jour de la table personnels
        Schema::table('personnels', function (Blueprint $table) {
            $table->uuid('departement_id')->nullable()->after('telephone');
            $table->uuid('poste_id')->nullable()->after('departement_id');
        });

        // 4. Tentative de migration des données textuelles vers les relations (Heuristique)
        // On lie le personnel aux départements/postes si le libellé correspond exactement
        $depts = DB::table('departements')->pluck('id_departement', 'libelle');
        foreach ($depts as $libelle => $id) {
            DB::table('personnels')->where('departement', $libelle)->update(['departement_id' => $id]);
        }

        $postes = DB::table('postes')->pluck('id_poste', 'libelle');
        foreach ($postes as $libelle => $id) {
            DB::table('personnels')->where('poste', $libelle)->update(['poste_id' => $id]);
        }

        // 5. Ajout des contraintes d'intégrité
        Schema::table('departements', function (Blueprint $table) {
            $table->foreign('responsable_id')->references('id_personnel')->on('personnels')->onDelete('set null');
        });

        Schema::table('postes', function (Blueprint $table) {
            // Note: On assume que la table 'roles' existe et utilise 'id_role' comme PK
            if (Schema::hasTable('roles')) {
                $table->foreign('role_id')->references('id_role')->on('roles')->onDelete('restrict');
            }
        });

        Schema::table('personnels', function (Blueprint $table) {
            $table->foreign('departement_id')->references('id_departement')->on('departements')->onDelete('restrict');
            $table->foreign('poste_id')->references('id_poste')->on('postes')->onDelete('restrict');
            
            // On supprime les anciennes colonnes texte
            $table->dropColumn('departement');
            $table->dropColumn('poste');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Mode destruction non réversible facilement dans ce contexte de dev rapide
    }
};
