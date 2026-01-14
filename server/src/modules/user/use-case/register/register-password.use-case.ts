import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from '../../repositories/account.repository';
import { LoginUserUseCase } from '../login/login-user.use-case';
import { RegisterUseCase } from './register.use-case';
import { UserCreatePayload } from '../../repositories/user.repository';
import { ClientInfo } from '@panah/contract';
import { validatePassword } from 'src/utils/validation';
import { HashService } from 'src/services/cipher/hash.service';

@Injectable()
export class RegisterPasswordUseCase {
  constructor(
    @Inject('PASSWORD_HASH_SERVICE') private readonly hashService: HashService,
    @Inject() private readonly accountRepository: AccountRepository,
    @Inject() private readonly register: RegisterUseCase,
    @Inject() private readonly login: LoginUserUseCase,
  ) {}

  /**
   * Register user with primitive strategy
   *
   * This method will create user
   * and create account with password authentication
   *
   * @param {UserCreatePayload} payload
   * @param {string} _password
   * @returns {Promise<User>}
   * @throws {EmailAlreadyExistsException}
   */
  public async execute(
    payload: UserCreatePayload,
    _password: string,
    client: ClientInfo,
  ) {
    // validate and hash password
    const validated = validatePassword(_password);
    const password = await this.hashService.hash(validated);

    const result = await this.register.execute(
      {
        ...payload,
        email: payload.email.toLowerCase(),
      },
      async (user, tx) => {
        return await this.accountRepository.createAccountWithPassword(
          {
            user_id: user.id,
            password,
          },
          { tx },
        );
      },
    );

    return await this.login.execute(result.account, result.user, client);
  }
}
