import { Duration } from 'date-fns';

export interface AuthConfig {
  remote_auth?: string;
  server_name: string;
  access_token_duration?: Duration;
  refresh_token_duration?: Duration;
}

export interface UserConfig {
  auth: AuthConfig;
}
