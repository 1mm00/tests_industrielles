<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

// Routes d'authentification
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Dashboard (nécessite authentification)
Route::get('/dashboard', [AuthController::class, 'dashboard'])
    ->middleware('auth')
    ->name('dashboard');

// Routes CRUD Tests (nécessite authentification)
Route::middleware('auth')->group(function () {
    Route::resource('tests', \App\Http\Controllers\TestController::class);
});
