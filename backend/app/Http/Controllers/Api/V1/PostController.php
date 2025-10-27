<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ApiResponse;
use Spatie\FlareClient\Api;

class PostController extends Controller
{
    public function index(Request $req)
    {
        $query = Post::with(['user', 'media', 'likes'])
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc');

        if ($search = $req->query('search')) {
            $query->where('caption', 'ILIKE', "%{$search}%");
        }

        $posts = $query->paginate($req->query('limit', 10));

        return ApiResponse::success($posts, 'Posts fetched successfully');
    }

    public function store(Request $req)
    {
        $req->validate([
            'caption' => 'nullable|string',
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:5120',
        ]);

        $post = Post::create([
            'user_id' => auth()->id(),
            'caption' => $req->caption
        ]);

        if ($req->hasFile('files')) {
            foreach ($req->file('files') as $i => $file) {
                $path = $file->store('posts/' . auth()->id(), 'public');
                $post->media()->create([
                    'file_path' => $path,
                    'media_type' => 'image',
                    'order_index' => $i
                ]);
            }
        }

        return ApiResponse::success($post->load('media'), 'Post created successfully', 201);
    }

    public function show($id)
    {
        $post = Post::with(['user', 'media', 'likes', 'comments.user'])
            ->withCount(['likes', 'comments'])
            ->where('unique_id', $id)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        return ApiResponse::success($post, 'Post fetched successfully');
    }

    public function update(Request $req, $id)
    {
        $post = Post::where('unique_id', $id)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        if ($post->user_id !== auth()->id()) {
            return ApiResponse::error('Unauthorized', 403);
        }

        $post->update(['caption' => $req->caption]);

        return ApiResponse::success($post, 'Post updated successfully');
    }

    public function destroy($id)
    {
        $post = Post::where('unique_id', $id)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        if ($post->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return ApiResponse::error('Unauthorized', 403);
        }

        foreach ($post->media as $media) {
            Storage::disk('public')->delete($media->file_path);
        }

        $post->delete();

        return ApiResponse::success(null, 'Post deleted successfully');
    }
}
