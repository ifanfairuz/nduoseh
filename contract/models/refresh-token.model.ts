export interface RefreshToken {
  id: string;
  session_id: string;
  token_hash: string;
  is_used: boolean;
  expires_at: Date;
}
