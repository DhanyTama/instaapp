"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
import toast from "react-hot-toast";

interface User {
    name: string;
    email: string;
    username: string;
    bio?: string;
    avatar_url?: string | null;
    role?: string;
    created_at?: string;
    updated_at?: string;
}

interface ApiResponseMe {
    success: boolean;
    message: string;
    data: { user: User };
}

interface ApiResponseAuth {
    success: boolean;
    message: string;
    data: { user: User; token: string };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (form: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
            setAuthToken(savedToken);
            fetchMe(savedToken).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const fetchMe = async (savedToken?: string) => {
        try {
            if (savedToken) setAuthToken(savedToken);
            const { data } = await api.get<ApiResponseMe>("/auth/me");

            if (data.success && data.data.user) {
                setUser(data.data.user);
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            logout();
            toast.error("Sesi telah berakhir. Silakan login kembali.");
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post<ApiResponseAuth>("/auth/login", { email, password });

            const token = data.data.token;
            const user = data.data.user;

            setUser(user);
            setToken(token);
            localStorage.setItem("token", token);
            setAuthToken(token);

            toast.success("Login berhasil!");
            router.push("/posts");
        } catch (error) {
            toast.error("Login gagal. Periksa email atau password.");
        }
    };

    const register = async (form: any) => {
        try {
            const { data } = await api.post<ApiResponseAuth>("/auth/register", form);

            const token = data.data.token;
            const user = data.data.user;

            setUser(user);
            setToken(token);
            localStorage.setItem("token", token);
            setAuthToken(token);

            toast.success("Registrasi berhasil!");
            router.push("/posts");
        } catch (error) {
            toast.error("Registrasi gagal. Silakan coba lagi.");
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthToken(undefined);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
