import { Account, User } from '@nduoseh/contract';

export class OnUserRegister {
  constructor(
    public readonly account: Account,
    public readonly user: User,
  ) {}
}
