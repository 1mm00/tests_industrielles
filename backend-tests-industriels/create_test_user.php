<?php

use App\Models\User;
use App\Models\Personnel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cin = "TEST123";
$email = strtolower($cin) . "@testindustrielle.com";

echo "Creating test user: $email\n";

$personnel = Personnel::create([
    'id_personnel' => Str::uuid()->toString(),
    'matricule' => 'TEST-001',
    'cin' => $cin,
    'nom' => 'Test',
    'prenom' => 'User',
    'email' => $email,
    'poste' => 'Ingénieur',
    'actif' => true,
]);

User::create([
    'name' => 'Test User',
    'email' => $email,
    'password' => Hash::make('password'),
    'id_personnel' => $personnel->id_personnel,
]);

echo "Success!\n";
