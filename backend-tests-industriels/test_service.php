<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new \App\Services\TestIndustrielService();
$data = $service->getCreationData();

foreach ($data as $key => $items) {
    echo "Key: $key, Count: " . count($items) . "\n";
    if (count($items) > 0) {
        echo "First item keys: " . implode(', ', array_keys($items[0]->toArray())) . "\n";
    }
}
