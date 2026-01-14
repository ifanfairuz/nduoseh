import { AuthSession, User } from '@panah/contract';

export class OnUserLogin {
  constructor(
    public readonly session: AuthSession,
    public readonly user: User,
  ) {}
}
