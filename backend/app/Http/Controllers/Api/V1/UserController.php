<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Spatie\FlareClient\Api;

class UserController extends Controller
{
    public function profile()
    {
        return ApiResponse::success(auth()->user(), 'User profile fetched successfully');
    }

    public function updateProfile(Request $req)
    {
        $user = auth()->user();

        if (!$user instanceof \App\Models\User) {
            $user = \App\Models\User::find(auth()->id());
        }

        $data = $req->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string|max:500',
        ]);

        $user->update($data);


        return ApiResponse::success($user, 'Profile updated successfully');
    }

    public function uploadAvatar(Request $req)
    {
        $req->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $authUser = auth()->user();
        $user = $authUser instanceof User
            ? $authUser
            : User::find(auth()->id());

        $path = $req->file('avatar')->store('avatars', 'public');

        $user->avatar_url = Storage::url($path);
        $user->save();

        return ApiResponse::success(['avatar_url' => $user->avatar_url], 'Avatar uploaded successfully');
    }

    public function show($username)
    {
        $user = User::where('username', $username)
            ->withCount(['posts', 'likes', 'comments'])
            ->firstOrFail();

        return ApiResponse::success($user, 'User profile fetched successfully');
    }
}
