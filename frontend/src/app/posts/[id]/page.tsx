"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import MainLayout from "@/components/MainLayout";

interface User {
    name: string;
    username: string;
    avatar_url: string | null;
    role?: string;
}

interface Media {
    file_path: string;
    media_type: string;
}

interface PostData {
    unique_id: string;
    caption: string;
    user: User;
    media: Media[];
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    likes?: { user?: User }[];
}

interface Comment {
    unique_id: string;
    body: string;
    user: User;
    replies?: Comment[];
}

interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    last_page: number;
}

export default function PostDetailPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const { user, logout } = useAuth();
    const [post, setPost] = useState<PostData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const { register, handleSubmit, reset } = useForm();
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL;

    const getImageUrl = useCallback(
        (path: string | null): string => {
            if (!path || path === "/default.png" || path === "/default.jpg") return "/default.jpg";
            const cleanPath = path.startsWith("/") ? path.slice(1) : path;
            return `${BASE_URL}/${cleanPath}`;
        },
        [BASE_URL]
    );

    const fetchPost = async () => {
        try {
            const res = await api.get<{ success: boolean; data: PostData }>(`/posts/${id}`);
            const postData = res.data.data;

            let liked = false;
            if (user && postData.likes) {
                liked = postData.likes.some((like) => like.user?.username === user.username);
            }

            setPost({ ...postData, is_liked: liked });
        } catch {
            toast.error("Gagal mengambil data postingan.");
        }
    };

    const fetchComments = async (page = 1, append = false) => {
        try {
            const res = await api.get<{ success: boolean; data: PaginatedResponse<Comment> }>(
                `/posts/${id}/comments?page=${page}`
            );
            const paginated = res.data.data;
            const newComments = paginated.data || [];
            setLastPage(paginated.last_page || 1);

            if (append) setComments((prev) => [...prev, ...newComments]);
            else setComments(newComments);

            setCurrentPage(paginated.current_page || 1);
        } catch {
            toast.error("Gagal memuat komentar.");
        }
    };

    const handleLoadMore = async () => {
        if (currentPage < lastPage) {
            setLoadingMore(true);
            await fetchComments(currentPage + 1, true);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id, user]);

    const toggleLike = async () => {
        if (!post || !user) {
            toast.error("Silakan login untuk melakukan like.");
            logout();
            router.push("/auth/login");
            return;
        }
        const newIsLiked = !post.is_liked;
        setPost((prev) =>
            prev
                ? { ...prev, is_liked: newIsLiked, likes_count: prev.likes_count + (newIsLiked ? 1 : -1) }
                : null
        );
        try {
            await api.post(`/posts/${id}/like`);
        } catch {
            fetchPost();
        }
    };

    const onSubmit = async (form: any) => {
        if (!user) {
            toast.error("Silakan login untuk berkomentar.");
            return;
        }
        if (!form.body) return;
        try {
            await api.post(`/posts/${id}/comments`, { body: form.body });
            reset();
            fetchComments();
        } catch {
            toast.error("Gagal mengirim komentar.");
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;
        if (!confirm("Yakin ingin menghapus komentar ini?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            toast.success("Komentar berhasil dihapus");
            fetchComments();
        } catch {
            toast.error("Gagal menghapus komentar.");
        }
    };

    if (!post) return <div className="text-center py-10">Loading...</div>;

    return (
        <MainLayout>
            <div className="space-y-4 pt-2">
                <div className="bg-white border border-gray-200">
                    <div className="flex items-center p-3 justify-between">
                        <div className="flex items-center">
                            <img
                                src={getImageUrl(post.user.avatar_url)}
                                className="w-9 h-9 rounded-full object-cover mr-3"
                                alt={`${post.user.username}'s avatar`}
                            />
                            <Link href={`/users/${post.user.username}`} className="font-semibold text-sm hover:underline">
                                @{post.user.username}
                            </Link>
                        </div>
                    </div>

                    {post.media?.[0] && (
                        <img
                            src={getImageUrl(post.media[0].file_path)}
                            className="w-full h-auto max-h-[600px] object-cover"
                            alt="Post media"
                        />
                    )}

                    <div className="p-3">
                        <div className="flex items-center space-x-4 mb-2">
                            <button
                                onClick={toggleLike}
                                className="text-xl transition-transform transform hover:scale-110"
                            >
                                {post.is_liked ? (
                                    <span className="text-red-500">❤️</span>
                                ) : (
                                    <span className="text-gray-500">🤍</span>
                                )}
                            </button>
                        </div>

                        <p className="font-semibold text-sm mb-2">{post.likes_count || 0} suka</p>
                        <p className="text-sm">
                            <span className="font-semibold mr-1 hover:underline cursor-pointer">
                                @{post.user.username}
                            </span>
                            {post.caption}
                        </p>
                    </div>
                </div>

                <div className="max-w-xl mx-auto text-gray-800 bg-white border border-gray-200 rounded-md p-4">
                    {user && (
                        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 mb-6">
                            <input
                                {...register("body", { required: true })}
                                placeholder="Tulis komentar..."
                                className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 transition"
                            >
                                Kirim
                            </button>
                        </form>
                    )}

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-4">Komentar ({comments.length})</h3>
                        {comments.length === 0 ? (
                            <p className="text-sm text-gray-500">Belum ada komentar.</p>
                        ) : (
                            <>
                                {comments.map((c) => (
                                    <div key={c.unique_id} className="pl-2 border-l-2 border-gray-100">
                                        <div className="flex items-start gap-2">
                                            <img
                                                src={getImageUrl(c.user.avatar_url)}
                                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                                alt={`${c.user.username}'s avatar`}
                                            />
                                            <div className="bg-gray-50 p-3 rounded-xl flex-1 relative">
                                                <Link
                                                    href={`/users/${c.user.username}`}
                                                    className="font-semibold text-sm hover:underline block"
                                                >
                                                    @{c.user.username}
                                                </Link>
                                                <p className="text-sm mt-0.5 whitespace-pre-wrap">{c.body}</p>

                                                {user && (user.username === c.user.username || user.role === "admin") && (
                                                    <button
                                                        onClick={() => handleDeleteComment(c.unique_id)}
                                                        className="absolute top-2 right-3 text-xs text-red-500 hover:underline"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {currentPage < lastPage && (
                                    <div className="text-center mt-6">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition"
                                        >
                                            {loadingMore ? "Memuat..." : "Muat lebih banyak komentar"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
