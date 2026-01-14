import { Duration } from 'date-fns';

function getServerName() {
  const base_url = process.env.BASE_URL;
  if (base_url) {
    const _url = new URL(base_url);
    return _url.host;
  }

  return 'kai-server';
}

export interface AuthConfig {
  remote_auth?: string;
  server_name: string;
  access_token_duration?: Duration;
  refresh_token_duration?: Duration;
}

export interface UserConfig {
  auth: AuthConfig;
}

export default {
  auth: {
    remote_auth: process.env.REMOTE_AUTH_URL,
    server_name: getServerName(),
    access_token_duration: { minutes: 10 },
    refresh_token_duration: { days: 10 },
  },
} as UserConfig;
