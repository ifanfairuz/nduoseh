import { existsSync, readFileSync } from 'fs';
import { UserConfig } from './modules/user/config';
import { join } from 'path';

type UserModule = 'user' | ['user', UserConfig?];

export type Modules = UserModule;
export interface AppConfig {
  modules: Modules[];
}

const defaultConfig: AppConfig = {
  modules: ['user'],
};

export function resolveConfig(): AppConfig {
  const file = join(__dirname, '..', 'config.json');
  if (existsSync(file)) {
    const content = readFileSync(file).toString('utf-8');
    return JSON.parse(content) as AppConfig;
  }

  return defaultConfig;
}
