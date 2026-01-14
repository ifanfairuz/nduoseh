import { Account, User } from '@panah/contract';

export class OnUserRegister {
  constructor(
    public readonly account: Account,
    public readonly user: User,
  ) {}
}
