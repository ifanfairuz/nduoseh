import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { XFile } from 'src/services/storage/contract/xfile';
import { UserImageDisk } from '../../storage/user-image.disk';
import { User } from '@nduoseh/contract';
import { AccountRepository } from '../../repositories/account.repository';
import { HashService } from 'src/services/cipher/hash.service';

export interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  callname?: string | null;
  password?: string;
  image?: {
    buffer: Buffer;
    mime?: string;
  } | null;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject() private readonly atomic: PrismaAtomicService,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly accountRepository: AccountRepository,
    @Inject() private readonly disk: UserImageDisk,
    @Inject() private readonly hash: HashService,
  ) {}

  async execute(input: UpdateUserInput, domain?: string) {
    // Check if user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.atomic.tx(async (tx) => {
      let image: XFile | undefined = undefined;
      try {
        const payload: Partial<Omit<User, 'id'>> = {
          name: input.name,
          email: input.email,
          callname: input.callname,
        };

        // save new image
        if (input.image) {
          image = await this.disk.save(input.image.buffer, {
            mime: input.image.mime,
          });
          payload.image = image.identifier;
        }

        // update user
        const user = await this.userRepository.update(input.userId, payload, {
          tx,
        });

        // update account password
        if (input.password) {
          await this.accountRepository.updatePasswordAccount(
            {
              user_id: input.userId,
              password: await this.hash.hash(input.password),
            },
            { tx },
          );
        }

        return {
          ...user,
          image: await (
            image ?? (user.image ? await this.disk.get(user.image) : undefined)
          )?.getUrl(domain),
        };
      } catch (error) {
        if (image) {
          await this.disk.delete(image.identifier);
        }
        throw error;
      }
    });
  }
}
