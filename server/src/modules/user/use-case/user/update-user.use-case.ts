import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';

interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  callname?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput) {
    // Check if user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user
    return await this.userRepository.update(input.userId, {
      name: input.name,
      email: input.email,
      callname: input.callname,
    });
  }
}
