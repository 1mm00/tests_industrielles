<?php

use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Listing all personnels:\n";
Personnel::all()->each(function($p) {
    echo "- Email: {$p->email}, CIN: {$p->cin}\n";
});
