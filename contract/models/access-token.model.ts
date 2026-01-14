export interface AccessToken {
  user_id: string;
  session_id: string;
  token_hash: string;
  expires_at: Date;
}

export interface VerifiedToken {
  user_id: string;
  session_id: string;
}
