/**
 * Account is a user account for authentication
 *
 */
export interface Account {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  access_token_expires_at: Date | null;
  refresh_token_expires_at: Date | null;
  id_token: string | null;
  scope: string | null;
  password: string | null;
}

/**
 * Account for password authentication
 *
 */
export interface PasswordAccount extends Account {
  password: string;
}
