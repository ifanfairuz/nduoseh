/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../../repositories/user.repository';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { UserImageDisk } from '../../storage/user-image.disk';
import { AccountRepository } from '../../repositories/account.repository';
import { HashService } from 'src/services/cipher/hash.service';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: UserRepository;
  let atomic: PrismaAtomicService;

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
          provide: PrismaAtomicService,
          useValue: {
            tx: jest
              .fn()
              .mockImplementation((callback: (tx: unknown) => unknown) =>
                callback({}),
              ),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AccountRepository,
          useValue: {
            updatePasswordAccount: jest.fn(),
          },
        },
        {
          provide: UserImageDisk,
          useValue: {
            get: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    atomic = module.get<PrismaAtomicService>(PrismaAtomicService);
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
      const mockTx: any = {};

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'update').mockResolvedValue(updatedUser);

      const result = await useCase.execute(updateData);

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        {
          name: updateData.name,
          email: updateData.email,
          callname: updateData.callname,
        },
        { tx: mockTx },
      );
      expect(result).toEqual({ ...updatedUser, image: undefined });
    });

    it('should update only provided fields', async () => {
      const updateData = {
        userId: 'user-1',
        name: 'Jane Doe',
      };

      const mockTx: any = {};

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'update').mockResolvedValue(mockUser);

      await useCase.execute(updateData);

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        {
          name: 'Jane Doe',
          email: undefined,
          callname: undefined,
        },
        { tx: mockTx },
      );
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
