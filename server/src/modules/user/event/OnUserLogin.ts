import { AuthSession } from '@nduoseh/contract';
import { MeResult } from '../repositories/user.repository';

export class OnUserLogin {
  constructor(
    public readonly session: AuthSession,
    public readonly user: MeResult,
  ) {}
}
