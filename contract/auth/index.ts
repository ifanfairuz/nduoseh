import type { User } from "../models";

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
