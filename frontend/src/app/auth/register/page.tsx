"use client";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";

interface RegisterFormData {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
    const { register: authRegister } = useAuth();

    const onSubmit = (data: RegisterFormData) => authRegister(data);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-2xl w-96 space-y-4">
                <h1 className="text-2xl font-bold text-center text-gray-800">Daftar Akun Baru</h1>

                <input
                    {...register("name", { required: "Nama wajib diisi." })}
                    placeholder="Nama Lengkap"
                    className="w-full border p-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                <input
                    {...register("username", { required: "Username wajib diisi." })}
                    placeholder="Username"
                    className="w-full border p-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

                <input
                    {...register("email", { required: "Email wajib diisi." })}
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                <input
                    {...register("password", { required: "Password wajib diisi.", minLength: { value: 6, message: "Minimal 6 karakter." } })}
                    type="password"
                    placeholder="Password (min 6 karakter)"
                    className="w-full border p-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                <input
                    {...register("password_confirmation", { required: "Konfirmasi Password wajib diisi." })}
                    type="password"
                    placeholder="Konfirmasi Password"
                    className="w-full border p-3 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
                />
                {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-semibold transition duration-200"
                >
                    Daftar
                </button>
            </form>
        </div>
    );
}