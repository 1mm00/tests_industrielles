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
Route::put('/auth/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::put('/auth/password', [AuthController::class, 'updatePassword'])->middleware('auth:sanctum');


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
    Route::get('tests/technician-stats', [TestIndustrielController::class, 'technicianStats']);

    // Mesures
    Route::get('tests/{test_id}/mesures', [\App\Http\Controllers\Api\V1\MesureController::class, 'index']);
    Route::post('tests/{test_id}/mesures', [\App\Http\Controllers\Api\V1\MesureController::class, 'store']);
    Route::put('mesures/{id}', [\App\Http\Controllers\Api\V1\MesureController::class, 'update']);
    Route::delete('mesures/{id}', [\App\Http\Controllers\Api\V1\MesureController::class, 'destroy']);

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

    // Types de Tests
    Route::get('type-tests/creation-data', [\App\Http\Controllers\Api\V1\TypeTestController::class, 'creationData']);
    Route::apiResource('type-tests', \App\Http\Controllers\Api\V1\TypeTestController::class);
});

// Compatibilité Frontend (sans v1 pour l'instant)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tests/stats', [TestIndustrielController::class, 'stats']);
    Route::get('/tests/calendar', [TestIndustrielController::class, 'calendar']);
    Route::get('/tests/creation-data', [TestIndustrielController::class, 'creationData']);
    Route::post('/tests/{id}/start', [TestIndustrielController::class, 'demarrer']);
    Route::post('/tests/{id}/finish', [TestIndustrielController::class, 'terminer']);
    Route::apiResource('tests', TestIndustrielController::class);
    Route::get('/tests/en-cours', [TestIndustrielController::class, 'index']);
    Route::get('/tests/technician-stats', [TestIndustrielController::class, 'technicianStats']);

    // Mesures
    Route::get('/tests/{test_id}/mesures', [\App\Http\Controllers\Api\V1\MesureController::class, 'index']);
    Route::post('/tests/{test_id}/mesures', [\App\Http\Controllers\Api\V1\MesureController::class, 'store']);
    Route::put('/mesures/{id}', [\App\Http\Controllers\Api\V1\MesureController::class, 'update']);
    Route::delete('/mesures/{id}', [\App\Http\Controllers\Api\V1\MesureController::class, 'destroy']);


    // Non-Conformités
    Route::get('/non-conformites/stats', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'stats']);
    Route::get('/non-conformites/creation-data', [\App\Http\Controllers\Api\V1\NonConformiteController::class, 'creationData']);
    Route::apiResource('non-conformites', \App\Http\Controllers\Api\V1\NonConformiteController::class);

    // Équipements
    Route::get('/equipements/stats', [\App\Http\Controllers\Api\V1\EquipementController::class, 'stats']);
    
    // Expertise Équipements (Specific routes must come before generic resource)
    Route::get('equipements/expertise', [\App\Http\Controllers\Api\V1\EquipementExpertiseController::class, 'getExpertiseData']);
    Route::get('equipements/export-asset-db', [\App\Http\Controllers\Api\V1\EquipementExpertiseController::class, 'exportAssetDatabase']);
    Route::post('equipements/sync-realtime', [\App\Http\Controllers\Api\V1\EquipementExpertiseController::class, 'syncRealTime']);
    
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
    Route::put('/roles/{id}/permissions', [\App\Http\Controllers\Api\V1\RoleController::class, 'updatePermissions']);

    
    // Postes et Départements
    Route::get('/postes', [\App\Http\Controllers\Api\V1\PosteController::class, 'index']);
    Route::get('/departements', [\App\Http\Controllers\Api\V1\DepartementController::class, 'index']);
    
    // Types de Tests
    Route::get('type-tests/creation-data', [\App\Http\Controllers\Api\V1\TypeTestController::class, 'creationData']);
    Route::apiResource('type-tests', \App\Http\Controllers\Api\V1\TypeTestController::class);
    
    // Designer de Méthodes (Checklists)
    Route::get('designer/checklists/{typeTestId}', [\App\Http\Controllers\Api\V1\ChecklistControleController::class, 'getByTypeTest']);
    Route::post('designer/checklists/{typeTestId}', [\App\Http\Controllers\Api\V1\ChecklistControleController::class, 'storeOrUpdate']);
    
    // Rapports de Tests
    Route::get('rapports/stats', [\App\Http\Controllers\Api\V1\RapportTestController::class, 'getStats']);
    Route::get('rapports/{id}/master-data', [\App\Http\Controllers\Api\V1\RapportTestController::class, 'getMasterReportData']);
    Route::post('rapports/{id}/valider', [\App\Http\Controllers\Api\V1\RapportTestController::class, 'valider']);
    Route::get('rapports/{id}/pdf', [\App\Http\Controllers\Api\V1\RapportTestController::class, 'downloadPdf']);
    Route::apiResource('rapports', \App\Http\Controllers\Api\V1\RapportTestController::class);
    
    // Dashboards
    Route::get('dashboard/ingenieur', [\App\Http\Controllers\Api\V1\DashboardController::class, 'getDashboardIngenieur']);
    Route::get('dashboard/technicien', [\App\Http\Controllers\Api\V1\DashboardController::class, 'getDashboardTechnicien']);
    Route::get('dashboard/analytics/pdf', [\App\Http\Controllers\Api\V1\DashboardController::class, 'downloadAnalyticsPdf']);
});

