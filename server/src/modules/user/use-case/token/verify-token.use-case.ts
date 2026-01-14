import { VerifiedToken } from '@panah/contract';
import { UserRepository } from '../../repositories/user.repository';
import { ErrorTokenException } from '../../exceptions/ErrorTokenException';

export interface AuthAudience {
  device_id?: string;
  user_agent?: string;
  ip_address?: string;
}

export abstract class VerifyTokenUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Verify client
   *
   * @param {string} token
   * @returns {Promise<VerifiedToken>}
   * @throws {ErrorAuthException}
   */
  public abstract execute(
    token: string,
    audience?: AuthAudience,
  ): Promise<VerifiedToken>;

  /**
   * Verify client and get user
   *
   * @param {string} token
   * @returns {Promise<VerifiedToken>}
   * @throws {ErrorAuthException}
   */
  public async executeAndGetUser(token: string, audience: AuthAudience = {}) {
    const access = await this.execute(token, audience);
    const user = await this.userRepo.findById(access.user_id);
    if (!user) {
      throw new ErrorTokenException('user not found');
    }

    return { user, access };
  }
}
