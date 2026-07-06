import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "../services/AuthService";
import { authService as defaultAuthService } from "../services/HttpAuthService";
import { LoginCredentials, LoginResult, LogoutResult } from "../model/types";

export interface UseAuthOptions {
  redirectAfterLogin?: string;
  redirectAfterLogout?: string;
}

export interface UseAuthResult {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  clearError: () => void;
}

/**
 * Hook for authentication operations with dependency injection support.
 * @param authService - Auth service implementation (optional, defaults to HttpAuthService)
 * @param options - Configuration options for redirects
 * @returns Authentication state and methods
 */
export function useAuth(
  authService: AuthService = defaultAuthService,
  options: UseAuthOptions = {}
): UseAuthResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { redirectAfterLogin = "/", redirectAfterLogout = "/login" } = options;

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authService.login(credentials);

        if (result.success) {
          router.push(redirectAfterLogin);
        } else {
          setError(result.error || "Login failed");
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [authService, router, redirectAfterLogin]
  );

  const logout = useCallback(async (): Promise<LogoutResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.logout();

      if (result.success) {
        router.push(redirectAfterLogout);
      } else {
        setError(result.error || "Logout failed");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [authService, router, redirectAfterLogout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
}
