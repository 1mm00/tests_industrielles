<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach(\App\Models\Poste::all() as $p) {
    echo "ID: {$p->id} | Libelle: {$p->libelle} | Categorie: {$p->categorie}\n";
}
