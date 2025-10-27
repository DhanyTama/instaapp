"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, setAuthToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/MainLayout";

interface User {
    name?: string;
    email?: string;
    username?: string;
    bio?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: User;
}

export default function ProfilePage() {
    const router = useRouter();
    const { token, user: authUser, logout, loading: authLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

            if (!storedToken) {
                toast.error("Token tidak ditemukan. Silakan login kembali.");
                logout();
                router.push("/auth/login");
                return;
            }

            setAuthToken(storedToken);

            const res = await api.get<ApiResponse>("/me");
            const data = res.data.data;

            setUser(data);
            setName(data.name || "");
            setBio(data.bio || "");
        } catch {
            toast.error("Gagal memuat profil.");
            logout();
            router.push("/auth/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push("/auth/login");
        } else {
            fetchProfile();
        }
    }, [authLoading, authUser]);

    const handleUpdateProfile = async () => {
        try {
            await api.put("/me", { name, bio });
            toast.success("Profil berhasil diperbarui!");
            fetchProfile();
        } catch {
            toast.error("Gagal memperbarui profil.");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Memuat profil...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                Profil tidak ditemukan.
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-4 pt-2">
                <div className="max-w-md mx-auto p-5">
                    <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nama</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border rounded p-2 mt-1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full border rounded p-2 mt-1"
                                rows={3}
                            />
                        </div>

                        <button
                            onClick={handleUpdateProfile}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
