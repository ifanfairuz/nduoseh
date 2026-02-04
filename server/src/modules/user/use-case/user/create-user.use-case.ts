import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AccountRepository } from '../../repositories/account.repository';
import { HashService } from 'src/services/cipher/hash.service';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { UserImageDisk } from '../../storage/user-image.disk';
import { XFile } from 'src/services/storage/contract/xfile';

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  callname?: string | null;
  image?: {
    buffer: Buffer;
    mime?: string;
  } | null;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject() private readonly atomic: PrismaAtomicService,
    @Inject() private readonly userRepository: UserRepository,
    @Inject() private readonly accountRepository: AccountRepository,
    @Inject() private readonly disk: UserImageDisk,
    @Inject() private readonly hashService: HashService,
  ) {}

  async execute(input: CreateUserInput, domain?: string) {
    return await this.atomic.tx(async (tx) => {
      let image: XFile | undefined = undefined;
      try {
        // Save image if provided
        if (input.image) {
          image = await this.disk.save(input.image.buffer, {
            mime: input.image.mime,
          });
        }

        // Create user (repository handles email existence check and ID generation)
        const user = await this.userRepository.create(
          {
            name: input.name,
            email: input.email,
            callname: input.callname || input.name.substring(0, 20),
            image: image?.identifier,
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
