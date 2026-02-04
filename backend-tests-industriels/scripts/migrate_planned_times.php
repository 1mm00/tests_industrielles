<?php

use Illuminate\Support\Facades\DB;

/**
 * Script de migration des données : Ajoute les heures planifiées aux tests existants
 * 
 * Exécution : php artisan tinker
 * Puis copier-coller ce code
 */

// Récupérer tous les tests qui n'ont pas d'heure planifiée
$tests = DB::table('tests_industriels')
    ->whereNull('heure_debut_planifiee')
    ->get();

echo "Tests trouvés sans heure planifiée : " . $tests->count() . "\n";

foreach ($tests as $test) {
    // Si le test a déjà une heure_debut, on l'utilise comme planifiée
    if ($test->heure_debut) {
        DB::table('tests_industriels')
            ->where('id_test', $test->id_test)
            ->update([
                'heure_debut_planifiee' => $test->heure_debut,
                'heure_fin_planifiee' => $test->heure_fin,
            ]);
        echo "✅ Test {$test->numero_test} mis à jour avec heures existantes\n";
    } else {
        // Sinon, on met l'heure actuelle pour permettre le démarrage immédiat
        DB::table('tests_industriels')
            ->where('id_test', $test->id_test)
            ->update([
                'heure_debut_planifiee' => date('H:i:s'),
                'heure_fin_planifiee' => date('H:i:s', strtotime('+2 hours')),
            ]);
        echo "✅ Test {$test->numero_test} initialisé avec heure actuelle\n";
    }
}

echo "\n✨ Migration terminée ! Tous les tests peuvent maintenant démarrer.\n";
