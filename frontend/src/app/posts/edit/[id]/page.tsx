"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface PostResponse {
    unique_id: string;
    caption: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export default function EditPostPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { token, user, loading: authLoading } = useAuth();
    const { register, handleSubmit, setValue } = useForm<{ caption: string }>();
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!token) return;
            try {
                const res = await api.get<ApiResponse<PostResponse>>(`/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data.data;
                setPost(data);
                setValue("caption", data.caption);
            } catch {
                toast.error("Gagal memuat post");
            } finally {
                setLoading(false);
            }
        };
        if (id && token) fetchPost();
    }, [id, token, setValue]);

    const onSubmit = async (form: any) => {
        if (!token) {
            toast.error("Token tidak ditemukan. Silakan login ulang.");
            return;
        }

        try {
            await api.put(
                `/posts/${id}`,
                { caption: form.caption || "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Post berhasil diperbarui");
            router.push("/posts");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Gagal update post");
        }
    };

    if (authLoading || loading) {
        return <div className="flex items-center justify-center h-screen text-gray-600">Memuat post...</div>;
    }

    if (!post) {
        return <div className="flex items-center justify-center h-screen text-gray-600">Post tidak ditemukan</div>;
    }

    return (
        <MainLayout>
            <div className="max-w-md mx-auto p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow space-y-4">
                    <textarea
                        {...register("caption")}
                        placeholder="Tulis caption..."
                        className="w-full border p-2 rounded"
                    />
                    <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition">
                        Update Post
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}
