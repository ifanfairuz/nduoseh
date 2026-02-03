import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { XFile } from 'src/services/storage/contract/xfile';
import { UserImageDisk } from '../../storage/user-image.disk';
import { User } from '@panah/contract';

export interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  callname?: string | null;
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
    @Inject() private readonly disk: UserImageDisk,
  ) {}

  async execute(input: UpdateUserInput, domain?: string) {
    // Check if user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    return await this.atomic.tx(async (tx) => {
      let image: XFile | undefined = undefined;
      try {
        const payload: Partial<Omit<User, 'id'>> = {
          name: input.name,
          email: input.email,
          callname: input.callname,
        };

        if (input.image) {
          image = await this.disk.save(input.image.buffer, {
            mime: input.image.mime,
          });
          payload.image = image.identifier;
        }

        const user = await this.userRepository.update(input.userId, payload, {
          tx,
        });

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
