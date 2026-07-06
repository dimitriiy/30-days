import { LoginCredentials, LoginResult, LogoutResult } from "../model/types";

/**
 * Interface for authentication service.
 * Defines the contract for auth operations without specifying implementation details.
 * This allows for easy mocking in tests and swapping implementations.
 */
export interface AuthService {
  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise with login result
   */
  login(credentials: LoginCredentials): Promise<LoginResult>;

  /**
   * Logout current user
   * @returns Promise with logout result
   */
  logout(): Promise<LogoutResult>;
}
