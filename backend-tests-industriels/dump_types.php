<?php
use App\Models\TypeTest;
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
echo json_encode(TypeTest::all());
