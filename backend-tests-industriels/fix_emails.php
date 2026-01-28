<?php

use App\Models\User;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting email update...\n";

$countUsers = 0;
User::where('email', 'like', '%@test_industrielle.com')->get()->each(function($user) use (&$countUsers) {
    $newEmail = str_replace('@test_industrielle.com', '@testindustrielle.com', $user->email);
    $user->update(['email' => $newEmail]);
    $countUsers++;
    echo "Updated User: {$user->email}\n";
});

$countPersonnel = 0;
Personnel::where('email', 'like', '%@test_industrielle.com')->get()->each(function($p) use (&$countPersonnel) {
    $newEmail = str_replace('@test_industrielle.com', '@testindustrielle.com', $p->email);
    $p->update(['email' => $newEmail]);
    $countPersonnel++;
    echo "Updated Personnel: {$p->email}\n";
});

echo "Finished! Updated $countUsers users and $countPersonnel personnel records.\n";
