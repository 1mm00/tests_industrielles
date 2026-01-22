<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Equipements: " . \App\Models\Equipement::count() . "\n";
echo "Types Tests: " . \App\Models\TypeTest::count() . "\n";
echo "Phases: " . \App\Models\PhaseTest::count() . "\n";
echo "Personnels: " . \App\Models\Personnel::count() . "\n";
echo "Users: " . \App\Models\User::count() . "\n";
