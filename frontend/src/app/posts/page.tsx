"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import MainLayout from "@/components/MainLayout";
import { useRouter } from "next/navigation";

interface Post {
    unique_id: string;
    caption: string;
    user: { name: string; username: string; avatar_url: string | null; role?: string };
    media: Array<{ unique_id: string; file_path: string; media_type: string }>;
    likes?: Array<{ user?: { username: string } }>;
    likes_count?: number;
    comments_count?: number;
    is_liked?: boolean;
}

export default function PostsPage() {
    const router = useRouter();
    const { token, user, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdowns, setDropdowns] = useState<{ [key: string]: boolean }>({});

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL;

    interface ApiPostsResponse {
        data: {
            current_page: number;
            data: Post[];
            last_page: number;
            total: number;
        };
    }

    const fetchPosts = useCallback(async (page: number, append = false, searchKeyword?: string) => {
        setIsLoading(true);
        try {
            let url = `/posts?page=${page}`;
            if (searchKeyword) url += `&search=${encodeURIComponent(searchKeyword)}`;

            const res = await api.get<ApiPostsResponse>(url);
            const data = res.data.data.data;

            const postsWithLike = data.map((post) => ({
                ...post,
                is_liked: user?.username
                    ? Array.isArray(post.likes) && post.likes.some((l) => l.user?.username === user.username)
                    : false,
            }));

            setCurrentPage(res.data.data.current_page);
            setTotalPages(res.data.data.last_page);
            setPosts((prev) => (append ? [...prev, ...postsWithLike] : postsWithLike));
        } catch (error) {
            toast.error("Gagal memuat postingan.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    const getImageUrl = (path: string | null) => {
        if (!path || path === "/default.png" || path === "/default.jpg") return "/default.jpg";
        return `${BASE_URL}/${path.startsWith("/") ? path.slice(1) : path}`;
    };

    const toggleLike = async (postId: string) => {
        if (!user || !token) {
            toast.error("Silakan login untuk melakukan like.");
            logout();
            router.push("/auth/login");
            return;
        }

        setPosts((prev) =>
            prev.map((p) =>
                p.unique_id === postId
                    ? { ...p, is_liked: !p.is_liked, likes_count: (p.likes_count || 0) + (p.is_liked ? -1 : 1) }
                    : p
            )
        );

        try {
            await api.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch {
            toast.error("Gagal melakukan like/unlike.");
            fetchPosts(currentPage);
        }
    };

    const loadMore = () => {
        if (currentPage < totalPages) fetchPosts(currentPage + 1, true);
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Yakin ingin menghapus post ini?")) return;

        try {
            await api.delete(`/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Post berhasil dihapus.");
            setPosts((prev) => prev.filter((p) => p.unique_id !== postId));
            setDropdowns((prev) => {
                const newState = { ...prev };
                delete newState[postId];
                return newState;
            });
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus post.");
        }
    };

    const toggleDropdown = (postId: string) => {
        setDropdowns((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    return (
        <MainLayout
            onSearch={async (keyword: string) => {
                await fetchPosts(1, false, keyword);
            }}
        >
            <div className="space-y-4 pt-2">
                {posts.map((p) => {
                    const canEditOrDelete = user?.username === p.user.username || user?.role === "admin";
                    const showDropdown = dropdowns[p.unique_id] || false;

                    return (
                        <div key={p.unique_id} className="bg-white border border-gray-200 relative">
                            <div className="flex items-center p-3 justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={getImageUrl(p.user.avatar_url)}
                                        className="w-9 h-9 rounded-full object-cover mr-3"
                                        alt={`${p.user.username}'s avatar`}
                                    />
                                    <Link
                                        href={`/users/${p.user.username}`}
                                        className="font-semibold text-sm hover:underline"
                                    >
                                        @{p.user.username}
                                    </Link>
                                </div>

                                {canEditOrDelete && (
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleDropdown(p.unique_id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ⋮
                                        </button>
                                        {showDropdown && (
                                            <div className="absolute right-0 mt-1 w-24 bg-white border rounded shadow-md z-10">
                                                <Link
                                                    href={`/posts/edit/${p.unique_id}`}
                                                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.unique_id)}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-500"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {p.media?.[0] && (
                                <Link href={`/posts/${p.unique_id}`} className="block">
                                    <img
                                        src={getImageUrl(p.media[0].file_path)}
                                        className="w-full h-auto max-h-[600px] object-cover"
                                        alt="Post media"
                                    />
                                </Link>
                            )}

                            <div className="p-3 flex flex-col gap-1">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => toggleLike(p.unique_id)}
                                        className="text-xl transition-transform transform hover:scale-110"
                                    >
                                        {p.is_liked ? <span className="text-red-500">❤️</span> : <span className="text-gray-500">🤍</span>}
                                    </button>
                                    <Link
                                        href={`/posts/${p.unique_id}`}
                                        className="text-gray-500 text-xl hover:text-gray-700"
                                    >
                                        💬
                                    </Link>
                                </div>
                                <p className="font-semibold text-sm">{p.likes_count || 0} suka</p>
                                <p className="text-sm">
                                    <span className="font-semibold mr-1">@{p.user.username}</span>
                                    {p.caption}
                                </p>

                                <Link
                                    href={`/posts/${p.unique_id}`}
                                    className="text-gray-400 text-sm mt-1 block hover:underline"
                                >
                                    Lihat semua {p.comments_count} komentar
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {isLoading && <p className="text-center text-blue-600">Memuat...</p>}
                {!isLoading && currentPage < totalPages && (
                    <button
                        onClick={loadMore}
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                    >
                        Muat Postingan Selanjutnya ({currentPage}/{totalPages})
                    </button>
                )}
            </div>
        </MainLayout>
    );
}
