"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { api, setAuthToken } from "@/lib/api";

interface MainLayoutProps {
    children: ReactNode;
    onSearch?: (keyword: string) => void;
}

type User = {
    name?: string;
    username?: string;
    avatar_url?: string | null;
};

export default function MainLayout({ children, onSearch }: MainLayoutProps) {
    const { token: contextToken, user: authUser } = useAuth();
    const [token, setToken] = useState<string | null>(contextToken || null);
    const [currentUser, setCurrentUser] = useState<User | null>(authUser || null);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const localToken =
            contextToken ||
            (typeof window !== "undefined" ? localStorage.getItem("token") : null);

        if (localToken) {
            setToken(localToken);
            setAuthToken(localToken);
        }

        if (!currentUser && localToken) {
            setCurrentUser(authUser || null);
        }
    }, [contextToken, authUser]);

    const getImageUrl = (path: string | null) => {
        if (!path || path === "/default.png" || path === "/default.jpg") return "/default.jpg";
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        return `${process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL}/${cleanPath}`;
    };

    return (
        <div className="max-w-xl mx-auto text-gray-800 bg-white min-h-screen">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-20">
                <Link href={currentUser ? `/profile` : "/auth/login"} className="flex items-center gap-2">
                    <img
                        src={getImageUrl(currentUser?.avatar_url || null)}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 hover:opacity-80 transition"
                        alt="Profile Avatar"
                    />
                    <span className="font-semibold text-base hidden sm:inline">
                        {currentUser?.username || currentUser?.name || "Guest"}
                    </span>
                </Link>

                <Link href={"/posts"}>
                    <h1 className="text-xl font-bold text-blue-600">InstaApp</h1>
                </Link>

                {currentUser ? (
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/auth/login");
                            toast.success("Anda berhasil logout.");
                        }}
                        className="p-1 text-sm font-medium rounded-md text-red-500 hover:bg-red-50 transition"
                        title="Logout"
                    >
                        Keluar
                    </button>
                ) : (
                    <button
                        onClick={() => router.push("/auth/login")}
                        className="p-1 text-sm font-medium rounded-md text-green-500 hover:bg-green-50 transition"
                        title="Login"
                    >
                        Login
                    </button>
                )}
            </div>

            {pathname === "/posts" && (
                <div className="flex items-center p-3 gap-3 border-b border-gray-200 bg-white">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onSearch?.(search);
                            }
                        }}
                        placeholder="Cari..."
                        className="flex-grow bg-gray-100 border-none rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />

                    {currentUser && (
                        <Link
                            href="/posts/create"
                            className="p-2 text-xl rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                            title="Buat Postingan"
                        >
                            ➕
                        </Link>
                    )}
                </div>
            )}

            <div className="pb-10">{children}</div>
        </div>
    );
}
