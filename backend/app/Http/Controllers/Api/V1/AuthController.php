<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'username' => 'required|string|unique:users|alpha_dash',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors(), 400);
        }

        $data = $validator->validated();
        $userData = $data;
        $userData['password'] = Hash::make($userData['password']);
        $userData['role'] = 'user';
        $user = User::create($userData);

        $token = JWTAuth::fromUser($user);

        return ApiResponse::success([
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
        ], 'Registration successful', 201);
    }

    public function login(Request $req)
    {
        $credentials = $req->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        return ApiResponse::success([
            'token' => $token,
            'user'  => auth('api')->user(),
        ], 'Login successful');
    }

    public function me()
    {
        return ApiResponse::success([
            'user' => auth()->user()
        ], 'User profile fetched successfully');
    }
}
