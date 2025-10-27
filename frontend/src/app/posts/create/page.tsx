"use client";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function CreatePost() {
    const { register, handleSubmit } = useForm();
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [authLoading, user]);

    const onSubmit = async (form: any) => {
        if (!form.image || form.image.length === 0) {
            toast.error("Silakan pilih file terlebih dahulu");
            return;
        }

        const formData = new FormData();
        formData.append("caption", form.caption || "");

        const files: FileList = form.image;
        for (let i = 0; i < files.length; i++) {
            formData.append("files[]", files[i]);
        }

        try {
            await api.post("/posts", formData, {
                headers: { Authorization: `Bearer ${token}` }, // jangan set Content-Type
            });
            toast.success("Postingan berhasil dibuat");
            router.push("/posts");
        } catch (error: any) {
            console.error(error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Gagal upload postingan");
        }
    };

    if (authLoading || !user) return <div className="text-center py-10">Loading...</div>;

    return (
        <MainLayout>
            <div className="space-y-4 pt-2">
                <div className="max-w-md mx-auto p-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow space-y-4">
                        <textarea {...register("caption")} placeholder="Tulis caption..." className="w-full border p-2 rounded" />
                        <input type="file" {...register("image")} accept="image/*" className="w-full border p-2 rounded" />
                        <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 transition">Posting</button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
