import type { User } from "../models";
import type { IMeResponse } from "../user";

export interface ClientInfo {
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
}

export interface TokenResponse {
  token: string;
  expires_at: number;
}

export interface LoginResponse {
  access_token: TokenResponse;
  refresh_token: TokenResponse;
  user: User;
}

export interface IAuthResponse {
  access_token: TokenResponse;
  user: IMeResponse;
}

export interface IRefreshTokenResponse {
  access_token: TokenResponse;
}

export interface IVerifyTokenResponse {
  user_id: string;
  session_id: string;
}

export interface ILoginWithPasswordBody {
  email: string;
  password: string;
}
