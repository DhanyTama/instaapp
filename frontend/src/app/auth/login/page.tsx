"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { register, handleSubmit } = useForm<LoginFormData>();
    const { login } = useAuth();

    const onSubmit = (data: LoginFormData) => login(data.email, data.password);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-2xl w-96 space-y-5">
                <h1 className="text-2xl font-bold text-center text-gray-800">Masuk Akun</h1>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="w-full border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                />

                <input
                    {...register("password")}
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                />

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-semibold transition duration-200"
                >
                    Masuk
                </button>

                <p className="text-center text-sm text-gray-500">
                    Belum punya akun?{" "}
                    <Link href="/auth/register" className="text-blue-600 hover:underline font-semibold">
                        Daftar
                    </Link>
                </p>
            </form>
        </div>
    );
}