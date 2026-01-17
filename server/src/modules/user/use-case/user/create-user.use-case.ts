import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AccountRepository } from '../../repositories/account.repository';
import { HashService } from 'src/services/cipher/hash.service';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  callname?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject() private readonly atomic: PrismaAtomicService,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly accountRepository: AccountRepository,
    @Inject() private readonly hashService: HashService,
  ) {}

  async execute(input: CreateUserInput) {
    return await this.atomic.tx(async (tx) => {
      // Create user (repository handles email existence check and ID generation)
      const user = await this.userRepository.create(
        {
          name: input.name,
          email: input.email,
          callname: input.callname || input.name.substring(0, 20),
        },
        { tx },
      );

      // Create password account
      const hashedPassword = await this.hashService.hash(input.password);
      await this.accountRepository.createAccountWithPassword(
        {
          user_id: user.id,
          password: hashedPassword,
        },
        { tx },
      );

      return user;
    });
  }
}
