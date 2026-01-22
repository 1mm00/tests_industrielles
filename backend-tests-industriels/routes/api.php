<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\TestIndustrielController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentification API
use App\Http\Controllers\AuthController;
Route::post('/auth/login', [AuthController::class, 'apiLogin']);
Route::post('/auth/logout', [AuthController::class, 'apiLogout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| API V1 Routes - Tests Industriels
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Tests Industriels - CRUD
    Route::get('tests/stats', [TestIndustrielController::class, 'stats']);
    Route::get('tests/calendar', [TestIndustrielController::class, 'calendar']);
    Route::get('tests/creation-data', [TestIndustrielController::class, 'creationData']);
    Route::apiResource('tests', TestIndustrielController::class);
    
    // Tests Industriels - Actions custom
    Route::post('tests/{id}/demarrer', [TestIndustrielController::class, 'demarrer']);
    Route::post('tests/{id}/terminer', [TestIndustrielController::class, 'terminer']);
    // Non-Conformités
    Route::get('non-conformites/stats', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'stats']);
    Route::get('non-conformites/creation-data', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'creationData']);
    Route::apiResource('non-conformites', \App\Http\Controllers\Api\V1\NonConformiteController::class);

    // Équipements
    Route::get('equipements/stats', [\App\Http\Controllers\Api\V1\EquipementController::class, 'stats']);
    Route::apiResource('equipements', \App\Http\Controllers\Api\V1\EquipementController::class);

    // Instruments
    Route::get('instruments/stats', [\App\Http\Controllers\Api\V1\InstrumentController::class, 'stats']);
    Route::get('instruments/alerts', [\App\Http\Controllers\Api\V1\InstrumentController::class, 'alerts']);
    Route::apiResource('instruments', \App\Http\Controllers\Api\V1\InstrumentController::class);

    // System
    Route::get('system/health', [\App\Http\Controllers\Api\V1\SystemController::class, 'health']);
    Route::get('system/notifications', [\App\Http\Controllers\Api\V1\SystemController::class, 'notifications']);

    // Reporting
    Route::get('reporting/performance', [\App\Http\Controllers\Api\V1\ReportingController::class, 'performance']);
    Route::get('reporting/reports', [\App\Http\Controllers\Api\V1\ReportingController::class, 'reports']);
    Route::post('reporting/reports', [\App\Http\Controllers\Api\V1\ReportingController::class, 'store']);

    // Personnel / Users
    Route::get('users/stats', [\App\Http\Controllers\Api\V1\UserController::class, 'stats']);
    Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
});

// Compatibilité Frontend (sans v1 pour l'instant)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tests/stats', [TestIndustrielController::class, 'stats']);
    Route::get('/tests/calendar', [TestIndustrielController::class, 'calendar']);
    Route::get('/tests/creation-data', [TestIndustrielController::class, 'creationData']);
    Route::apiResource('tests', TestIndustrielController::class);
    Route::get('/tests/en-cours', [TestIndustrielController::class, 'index']);

    // Non-Conformités
    Route::get('/non-conformites/stats', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'stats']);
    Route::get('/non-conformites/creation-data', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'creationData']);
    Route::apiResource('non-conformites', \App\Http\Controllers\Api\V1\NonConformiteController::class);

    // Équipements
    Route::get('/equipements/stats', [\App\Http\Controllers\Api\V1\EquipementController::class, 'stats']);
    Route::apiResource('equipements', \App\Http\Controllers\Api\V1\EquipementController::class);

    // Instruments
    Route::get('/instruments/stats', [\App\Http\Controllers\Api\V1\InstrumentController::class, 'stats']);
    Route::get('/instruments/alerts', [\App\Http\Controllers\Api\V1\InstrumentController::class, 'alerts']);
    Route::apiResource('instruments', \App\Http\Controllers\Api\V1\InstrumentController::class);

    // System
    Route::get('/system/health', [\App\Http\Controllers\Api\V1\SystemController::class, 'health']);
    Route::get('/system/notifications', [\App\Http\Controllers\Api\V1\SystemController::class, 'notifications']);

    // Reporting
    Route::get('/reporting/performance', [\App\Http\Controllers\Api\V1\ReportingController::class, 'performance']);
    Route::get('/reporting/reports', [\App\Http\Controllers\Api\V1\ReportingController::class, 'reports']);
    Route::post('/reporting/reports', [\App\Http\Controllers\Api\V1\ReportingController::class, 'store']);

    // Personnel / Users
    Route::get('/users/stats', [\App\Http\Controllers\Api\V1\UserController::class, 'stats']);
    Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
    
    // Personnel
    Route::post('/personnel', [\App\Http\Controllers\Api\V1\PersonnelController::class, 'store']);
    Route::put('/personnel/{id}', [\App\Http\Controllers\Api\V1\PersonnelController::class, 'update']);
    Route::delete('/personnel/{id}', [\App\Http\Controllers\Api\V1\PersonnelController::class, 'destroy']);
    
    // Roles
    Route::get('/roles', [\App\Http\Controllers\Api\V1\RoleController::class, 'index']);
    
    // Postes et Départements
    Route::get('/postes', [\App\Http\Controllers\Api\V1\PosteController::class, 'index']);
    Route::get('/departements', [\App\Http\Controllers\Api\V1\DepartementController::class, 'index']);
});

