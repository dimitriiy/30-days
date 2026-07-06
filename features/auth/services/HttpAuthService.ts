import { httpPost } from "@/lib/api";
import { AuthService } from "./AuthService";
import { LoginCredentials, LoginResult, LogoutResult } from "../model/types";

/**
 * HTTP implementation of AuthService.
 * Communicates with the backend API for authentication operations.
 */
export class HttpAuthService implements AuthService {
  private readonly loginEndpoint: string;
  private readonly logoutEndpoint: string;

  constructor(
    loginEndpoint: string = "/api/auth/login",
    logoutEndpoint: string = "/api/auth/logout"
  ) {
    this.loginEndpoint = loginEndpoint;
    this.logoutEndpoint = logoutEndpoint;
  }

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      await httpPost<void, LoginCredentials>(
        this.loginEndpoint,
        credentials
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      await httpPost<void, Record<string, never>>(
        this.logoutEndpoint,
        {}
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }
}

/**
 * Singleton instance of HttpAuthService for convenient use.
 * Can be overridden via dependency injection in components.
 */
export const authService = new HttpAuthService();
