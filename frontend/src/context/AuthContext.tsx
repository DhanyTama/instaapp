"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "@/lib/api";
import toast from "react-hot-toast";

type User = { id: number; name: string; email: string; username: string; avatar_url?: string };
type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
            setAuthToken(savedToken);
            fetchMe();
        }
    }, []);

    const fetchMe = async () => {
        try {
            const { data }: { data: User } = await api.get("/auth/me");
            setUser(data);
        } catch {
            logout();
        }
    };

    const login = async (email: string, password: string) => {
        try {
            interface LoginResponse {
                success: boolean;
                message: string;
                data: {
                    user: User;
                    token: string;
                }
            }

            const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
            setUser(data.data.user);
            setToken(data.data.token);
            localStorage.removeItem("token");
            localStorage.setItem("token", data.data.token);
            setAuthToken(data.data.token);
            toast.success("Login berhasil!");
        } catch {
            toast.error("Login gagal");
        }
    };

    const register = async (form: any) => {
        try {
            interface RegisterResponse {
                success: boolean;
                message: string;
                data: {
                    user: User;
                    token: string;
                }
            }

            const { data } = await api.post<RegisterResponse>("/auth/register", form);
            setUser(data.data.user);
            setToken(data.data.token);
            localStorage.removeItem("token");
            localStorage.setItem("token", data.data.token);
            setAuthToken(data.data.token);
            toast.success("Registrasi sukses!");
        } catch {
            toast.error("Registrasi gagal");
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setAuthToken(undefined);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;
