<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Spatie\FlareClient\Api;

class CommentController extends Controller
{
    public function index($postId)
    {
        $post = Post::where('unique_id', $postId)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        $comments = Comment::with(['user'])
            ->where('post_id', $post->id)
            ->whereNull('parent_id')
            ->with(['replies.user'])
            ->orderBy('created_at', 'asc')
            ->paginate(10);

        return ApiResponse::success('Comments retrieved successfully', $comments);
    }

    public function store(Request $req, $postId)
    {
        $req->validate([
            'body' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);

        $user = auth()->user();
        $post = Post::where('unique_id', $postId)->first();
        if (!$post) {
            return ApiResponse::error('Post not found', 404);
        }

        $comment = Comment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'body' => $req->body,
            'parent_id' => $req->parent_id
        ]);

        return ApiResponse::success('Comment added successfully', $comment->load('user'), 201);
    }

    public function destroy($commentId)
    {
        $comment = Comment::where('unique_id', $commentId)->first();
        if (!$comment) {
            return ApiResponse::error('Comment not found', 404);
        }

        $this->authorize('delete', $comment);
        $comment->delete();

        return ApiResponse::success('Comment deleted successfully');
    }
}
