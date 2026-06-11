"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api/authApi";
import { Loader } from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clearUser = useAuthStore((s) => s.clearUser);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

      if (!token) {
        if (!cancelled) {
          setBootstrapping(false);
          router.replace("/login");
        }
        return;
      }

      if (user) {
        if (!cancelled) setBootstrapping(false);
        return;
      }

      setLoading(true);
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        clearUser();
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setBootstrapping(false);
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [user, router, setUser, setLoading, clearUser]);

  useEffect(() => {
    if (!bootstrapping && !isLoading && user && requiredRole && user.role !== requiredRole) {
      router.replace("/dashboard");
    }
  }, [bootstrapping, isLoading, user, requiredRole, router]);

  if (bootstrapping || isLoading) {
    return <Loader text="Verifying session..." fullScreen />;
  }

  if (!user) return null;

  return <>{children}</>;
}
