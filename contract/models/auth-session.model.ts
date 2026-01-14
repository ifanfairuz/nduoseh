/**
 * Session is a user auth session
 *
 */
export interface AuthSession {
  id: string;
  user_id: string;
  account_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_id: string | null;
}
