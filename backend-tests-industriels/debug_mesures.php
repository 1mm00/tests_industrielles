<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get the last completed test with its mesures
$lastTest = App\Models\TestIndustriel::where('statut_test', 'TERMINE')->latest()->first();

if (!$lastTest) {
    echo "NO COMPLETED TEST FOUND\n";
    exit;
}

echo "TEST_ID=" . $lastTest->id_test . "\n";
echo "NUMERO=" . $lastTest->numero_test . "\n";

// Count mesures directly
$count = App\Models\Mesure::where('test_id', $lastTest->id_test)->count();
echo "MESURES_COUNT=" . $count . "\n";

// Get all mesure test_ids
$allMesures = App\Models\Mesure::all(['id_mesure', 'test_id', 'parametre_mesure', 'valeur_mesuree', 'conforme']);
echo "\nALL_MESURES_IN_DB:\n";
foreach ($allMesures as $m) {
    echo "  mesure_test_id=" . $m->test_id . " param=" . $m->parametre_mesure . " val=" . $m->valeur_mesuree . " conforme=" . ($m->conforme ? 'true' : 'false') . "\n";
}

// Now load via the service (same as API)
$service = app(App\Services\TestIndustrielService::class);
$details = $service->getTestDetails($lastTest->id_test);
echo "\nSERVICE_MESURES_LOADED=" . ($details->relationLoaded('mesures') ? 'true' : 'false') . "\n";
echo "SERVICE_MESURES_COUNT=" . $details->mesures->count() . "\n";

// Output the JSON keys of the response
$arr = $details->toArray();
echo "\nJSON_KEYS=" . implode(',', array_keys($arr)) . "\n";

// Check if 'mesures' key exists
echo "HAS_MESURES_KEY=" . (isset($arr['mesures']) ? 'true' : 'false') . "\n";
echo "MESURES_ARRAY_COUNT=" . (isset($arr['mesures']) ? count($arr['mesures']) : 0) . "\n";

// Write full JSON to file for inspection
file_put_contents(__DIR__ . '/debug_output.json', json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "\nFull JSON written to debug_output.json\n";
