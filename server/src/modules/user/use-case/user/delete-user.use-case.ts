import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject() private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    // Check if user exists (findById only returns non-deleted users)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete user
    await this.userRepository.delete(userId);

    return { success: true, message: 'User deleted successfully' };
  }
}
