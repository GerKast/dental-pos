<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route(auth()->check() ? 'dashboard' : 'login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // ruta modulo productos
    Route::resource('products', ProductController::class)
        ->only(['index', 'store']);

    // Ruta para el modulo clientes
    Route::resource('clients', ClientController::class)->only(['index', 'store', 'show']);

    // Ruta para guardar la fórmula médica
    Route::post('/clients/{client}/prescriptions', [ClientController::class, 'storePrescription'])
        ->name('clients.prescriptions.store');

    // ruta para el modulo ordenes de venta
    Route::get('/pos', [OrderController::class, 'index'])->name('pos.index');
    Route::post('/pos', [OrderController::class, 'store'])->name('pos.store');
    Route::get('/pos/{order}', [OrderController::class, 'show'])->name('pos.show');

});

require __DIR__.'/auth.php';
