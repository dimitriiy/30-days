export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface LogoutResult {
  success: boolean;
  error?: string;
}
