export interface AuthProviderClientId {
  id: number;
  provider: string;
  client_id: string;
  secret: string;
  active: boolean;
  tags: string[];
}
