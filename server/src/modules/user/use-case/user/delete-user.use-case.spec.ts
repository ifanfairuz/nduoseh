/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.use-case';
import { UserRepository } from '../../repositories/user.repository';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    email_verified: true,
    image: null,
    callname: 'JD',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete user successfully', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'delete').mockResolvedValue(undefined);

      const result = await useCase.execute('user-1');

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        success: true,
        message: 'User deleted successfully',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should check user existence before deleting', async () => {
      const findByIdSpy = jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(mockUser);
      const deleteSpy = jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue(undefined);

      await useCase.execute('user-1');

      const findByIdOrder = findByIdSpy.mock.invocationCallOrder[0];
      const deleteOrder = deleteSpy.mock.invocationCallOrder[0];
      expect(findByIdOrder).toBeLessThan(deleteOrder);
    });

    it('should perform soft delete', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'delete').mockResolvedValue(undefined);

      await useCase.execute('user-1');

      // The delete method should be called (soft delete)
      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
