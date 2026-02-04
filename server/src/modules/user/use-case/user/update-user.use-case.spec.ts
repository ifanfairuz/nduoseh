/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../../repositories/user.repository';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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
        UpdateUserUseCase,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update user successfully', async () => {
      const updateData = {
        userId: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        callname: 'JD',
      };

      const updatedUser = { ...mockUser, ...updateData };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'update').mockResolvedValue(updatedUser);

      const result = await useCase.execute(updateData);

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        name: updateData.name,
        email: updateData.email,
        callname: updateData.callname,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update only provided fields', async () => {
      const updateData = {
        userId: 'user-1',
        name: 'Jane Doe',
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'update').mockResolvedValue(mockUser);

      await useCase.execute(updateData);

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        name: 'Jane Doe',
        email: undefined,
        callname: undefined,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateData = {
        userId: 'non-existent-id',
        name: 'Jane Doe',
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(useCase.execute(updateData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(updateData)).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should check user existence before updating', async () => {
      const updateData = {
        userId: 'user-1',
        email: 'newemail@example.com',
      };

      const findByIdSpy = jest
        .spyOn(userRepository, 'findById')
        .mockResolvedValue(mockUser);
      const updateSpy = jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue(mockUser);

      await useCase.execute(updateData);

      const findByIdOrder = findByIdSpy.mock.invocationCallOrder[0];
      const updateOrder = updateSpy.mock.invocationCallOrder[0];
      expect(findByIdOrder).toBeLessThan(updateOrder);
    });
  });
});
