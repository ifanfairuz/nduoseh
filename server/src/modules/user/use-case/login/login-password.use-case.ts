import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from '../../repositories/account.repository';
import { LoginUserUseCase } from './login-user.use-case';
import {
  ErrorValidationException,
  PasswordValidationException,
} from 'src/utils/validation';
import { HashService } from 'src/services/cipher/hash.service';
import {
  ClientInfo,
  ILoginWithPasswordBody,
  LoginResponse,
} from '@panah/contract';

export interface LoginPasswordPayload {
  data: ILoginWithPasswordBody;
  client: ClientInfo;
}

@Injectable()
export class LoginPasswordUseCase {
  constructor(
    @Inject('PASSWORD_HASH_SERVICE') private readonly hashService: HashService,
    @Inject() private readonly account: AccountRepository,
    @Inject() private readonly login: LoginUserUseCase,
  ) {}

  /**
   * Login user with password
   *
   * @param {Client} client
   * @param {string} payload.email - email address
   * @param {string} payload.password - password
   *
   * @throws {UserNotFoundException} if user not found
   * @throws {InvalidPasswordException} if password is invalid
   *
   * @returns {Promise<User>}
   */
  public async execute(payload: LoginPasswordPayload): Promise<LoginResponse> {
    // get password account by email
    const account = await this.account.findPasswordByUserEmail(
      payload.data.email.toLowerCase(),
    );
    if (!account) {
      throw new ErrorValidationException(
        "Email doesn't exist",
        'INVALID_EMAIL',
        'email',
      );
    }

    // check password
    const valid = await this.hashService.verify(
      account.password,
      payload.data.password,
    );
    if (!valid) {
      throw new PasswordValidationException(
        'Invalid password',
        'INVALID_PASSWORD',
      );
    }

    const { user, ..._account } = account;
    return await this.login.execute(_account, user, payload.client);
  }
}
