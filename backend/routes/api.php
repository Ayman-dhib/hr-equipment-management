<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\DashboardController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('equipment', EquipmentController::class);
    Route::apiResource('leave-requests', LeaveRequestController::class);

    Route::put('/leave-requests/{id}/status', [LeaveRequestController::class, 'updateStatus']);
});
