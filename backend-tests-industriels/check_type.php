<?php
use App\Models\TypeTest;
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$t = TypeTest::where('code_type', 'PERF-MEC')->first();
echo $t ? json_encode($t) : "NOT FOUND";
