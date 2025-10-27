"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/MainLayout";

interface User {
    name?: string;
    username?: string;
    bio?: string | null;
    avatar_url?: string | null;
    posts_count?: number;
    likes_count?: number;
    comments_count?: number;
    role?: string;
}

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const router = useRouter();
    const { user: currentUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!username) return;

            try {
                const res = await api.get(`/users/${username}`);
                const data = res.data as { success: boolean; data?: User };

                if (!data.success || !data.data) {
                    toast.error("Data user tidak ditemukan");
                    setLoading(false);
                    return;
                }

                const fetchedUser = data.data;

                if (fetchedUser.role === "admin" && currentUser?.role !== "admin") {
                    toast.error("Anda tidak memiliki akses ke halaman admin");
                    setLoading(false);
                    router.push("/posts");
                    return;
                }

                setUser(fetchedUser);
            } catch (error: any) {
                const msg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Gagal memuat profil user";
                toast.error(msg);
                setLoading(false);
                router.push("/posts");
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) fetchUser();
    }, [username, currentUser, authLoading, router]);

    const getImageUrl = (path: string | null) => {
        if (!path || path === "/default.jpg" || path === "/default.png") return "/default.jpg";
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL}/${cleanPath}`;
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Memuat profil pengguna...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Pengguna tidak ditemukan.
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-4 pt-2">
                <div className="max-w-lg mx-auto p-5">
                    <div className="flex flex-col items-center mb-6">
                        <img
                            src={getImageUrl(user.avatar_url || null)}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-3"
                        />
                        <h1 className="text-2xl font-bold">{user.name || "Tanpa Nama"}</h1>
                        <p className="text-gray-500">@{user.username}</p>
                        {user.bio && <p className="mt-2 text-center text-gray-700">{user.bio}</p>}
                    </div>

                    <div className="flex justify-around text-center mb-5">
                        <div>
                            <p className="text-lg font-semibold">{user.posts_count || 0}</p>
                            <p className="text-gray-500 text-sm">Postingan</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{user.likes_count || 0}</p>
                            <p className="text-gray-500 text-sm">Likes</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{user.comments_count || 0}</p>
                            <p className="text-gray-500 text-sm">Komentar</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/posts"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            🔙 Kembali ke Feed
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
