<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Post;
use Illuminate\Http\Request;
use Spatie\FlareClient\Api;

class LikeController extends Controller
{
    public function toggle($postId)
    {
        $user = auth()->user();
        $post = Post::where('unique_id', $postId)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        $like = Like::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($like) {
            $like->delete();

            return ApiResponse::success(['message' => 'Like removed']);
        } else {
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);

            return ApiResponse::success(['message' => 'Liked']);
        }
    }

    public function getLikes($postId)
    {
        $post = Post::with(['likes.user'])->where('unique_id', $postId)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        $likes = $post->likes->map(function ($like) {
            return [
                'id' => $like->id,
                'user' => [
                    'id' => $like->user->id,
                    'username' => $like->user->username,
                    'avatar_url' => $like->user->avatar_url
                ],
                'created_at' => $like->created_at
            ];
        });

        return ApiResponse::success([
            'total' => $post->likes()->count(),
            'likes' => $likes
        ], 'Likes retrieved successfully');
    }
}
