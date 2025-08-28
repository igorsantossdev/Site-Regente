<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\RegController;
use App\Models\User;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Route;

Route::apiResource('/user', RegController::class);
Route::apiResource('/posts', PostController::class);

Route::get('/posts/{userId}/{postId}', [PostController::class, 'showOne']);
