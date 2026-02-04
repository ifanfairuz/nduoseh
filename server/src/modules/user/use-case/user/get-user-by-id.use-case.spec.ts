/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserImageDisk } from '../../storage/user-image.disk';

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    email_verified: true,
    image: null,
    callname: 'JD',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: UserImageDisk,
          useValue: {
            get: jest.fn().mockResolvedValue({
              getUrl: jest
                .fn()
                .mockResolvedValue('http://example.com/avatar.jpg'),
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      const result = await useCase.execute('user-1');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          deleted_at: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          email_verified: true,
          image: true,
          callname: true,
          created_at: true,
          updated_at: true,
        },
      });
      expect(result).toEqual({ ...mockUser, image: undefined });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });

    it('should only query non-deleted users', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);

      await useCase.execute('user-1');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deleted_at: null }),
        }),
      );
    });
  });
});
