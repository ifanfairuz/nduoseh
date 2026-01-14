import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Account, User } from '@panah/contract';
import { ErrorValidationException } from 'src/utils/validation';
import { PrismaAtomicService, Tx } from 'src/services/prisma/atomic.service';
import {
  UserCreatePayload,
  UserRepository,
} from '../../repositories/user.repository';
import { OnUserRegister } from '../../event/OnUserRegister';
import { EmailAlreadyExistsException } from '../../exceptions/EmailAlreadyExistsException';

@Injectable()
export class RegisterUseCase {
  public constructor(
    @Inject() private readonly emitter: EventEmitter2,
    @Inject() private readonly atomic: PrismaAtomicService,
    @Inject() private readonly userRepository: UserRepository,
  ) {}

  /**
   * Dispatch hooks
   *
   */
  private async dispatchHooks(account: Account, user: User) {
    await this.emitter.emitAsync(
      'user.register',
      new OnUserRegister(account, user),
    );
  }

  /**
   * Register user
   *
   * This method will create user
   * and create account with specified strategy
   *
   * @param {UserCreatePayload} payload
   * @param {(user: User, tx: Tx) => Promise<Account>} accountCreator
   * @returns
   */
  public async execute(
    user_data: UserCreatePayload,
    accountCreator: (user: User, tx: Tx) => Promise<Account>,
  ) {
    try {
      const result = await this.atomic.tx(async (tx) => {
        // create user
        const user = await this.userRepository.create(
          {
            ...user_data,
            email: user_data.email.toLowerCase(),
            callname: '',
          },
          { tx },
        );
        // create account
        const account = await accountCreator(user, tx);

        return { user, account };
      });

      // call hooks
      await this.dispatchHooks(result.account, result.user);

      return result;
    } catch (error) {
      if (error instanceof EmailAlreadyExistsException) {
        throw new ErrorValidationException(
          'Email already exists',
          'EMAIL_ALREADY_EXISTS',
          'email',
        );
      }

      throw error;
    }
  }
}
