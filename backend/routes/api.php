<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\LikeController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\UserController;

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

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->name('register');
    Route::post('auth/login', [AuthController::class, 'login'])->name('login');

    Route::get('posts', [PostController::class, 'index']);
    Route::get('posts/{id}', [PostController::class, 'show']);

    Route::get('posts/{id}/comments', [CommentController::class, 'index']);

    Route::get('users/{username}', [UserController::class, 'show']);

    Route::middleware('auth:api')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me'])->name('me');

        Route::get('me', [UserController::class, 'profile']);
        Route::put('me', [UserController::class, 'updateProfile']);

        Route::apiResource('posts', PostController::class)
            ->except(['index', 'show'])
            ->name('*', 'api.v1.posts');

        Route::post('posts/{postId}/like', [LikeController::class, 'toggle']);
        Route::get('posts/{postId}/likes', [LikeController::class, 'getLikes']);

        Route::post('posts/{id}/comments', [CommentController::class, 'store']);
        Route::delete('comments/{id}', [CommentController::class, 'destroy']);
    });
});

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
