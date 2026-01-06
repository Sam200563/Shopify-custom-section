"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    user_metadata?: {
        full_name?: string;
    };
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();
            if (data.user) {
                setUser({
                    ...data.user,
                    user_metadata: {
                        full_name: data.user.name
                    }
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const signOut = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.refresh();
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}
