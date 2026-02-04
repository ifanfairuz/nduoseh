/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.use-case';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserImageDisk } from '../../storage/user-image.disk';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let prismaService: PrismaService;

  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      email_verified: true,
      image: null,
      callname: 'JD',
      created_at: new Date('2024-01-03'),
      updated_at: new Date('2024-01-03'),
      deleted_at: null,
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      email_verified: false,
      image: 'avatar.jpg',
      callname: 'JS',
      created_at: new Date('2024-01-02'),
      updated_at: new Date('2024-01-02'),
      deleted_at: null,
    },
    {
      id: 'user-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      email_verified: true,
      image: null,
      callname: 'BJ',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      deleted_at: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
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

    useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute - basic pagination', () => {
    it('should return first page with default pagination', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await useCase.execute();

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { deleted_at: null },
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { deleted_at: null },
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
        orderBy: [{ created_at: 'asc' }],
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: [
          { ...mockUsers[0], image: null },
          { ...mockUsers[1], image: 'http://example.com/avatar.jpg' },
          { ...mockUsers[2], image: null },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      });
    });

    it('should return second page', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await useCase.execute({ page: 2, limit: 10 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * limit
          take: 10,
        }),
      );

      expect(result.pagination.page).toBe(2);
    });

    it('should handle custom page size', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await useCase.execute({ page: 1, limit: 20 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );

      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(3); // Math.ceil(50/20)
    });

    it('should enforce minimum page of 1', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await useCase.execute({ page: 0, limit: 10 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // Should be treated as page 1
        }),
      );

      expect(result.pagination.page).toBe(1);
    });

    it('should enforce maximum limit of 100', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      await useCase.execute({ page: 1, limit: 200 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('should enforce minimum limit of 1', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      await useCase.execute({ page: 1, limit: 0 });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });

    it('should calculate totalPages correctly', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(25);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10)
    });

    it('should handle empty results', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      const result = await useCase.execute({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should only return non-deleted users', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      await useCase.execute();

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deleted_at: null }),
        }),
      );
    });
  });

  describe('execute - keyword search', () => {
    it('should search users by name', async () => {
      const matchedUsers = [mockUsers[0]]; // John Doe
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(matchedUsers);

      const result = await useCase.execute({ keyword: 'john' });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deleted_at: null,
            OR: [
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
              { callname: { contains: 'john', mode: 'insensitive' } },
            ],
          },
        }),
      );

      expect(result.data).toEqual([{ ...matchedUsers[0], image: null }]);
      expect(result.pagination.total).toBe(1);
    });

    it('should search users by email', async () => {
      const matchedUsers = [mockUsers[1]]; // jane@example.com
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(matchedUsers);

      await useCase.execute({ keyword: 'jane@example' });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deleted_at: null,
            OR: [
              { name: { contains: 'jane@example', mode: 'insensitive' } },
              { email: { contains: 'jane@example', mode: 'insensitive' } },
              { callname: { contains: 'jane@example', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should search users by callname', async () => {
      const matchedUsers = [mockUsers[2]]; // BJ
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(matchedUsers);

      await useCase.execute({ keyword: 'BJ' });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deleted_at: null,
            OR: [
              { name: { contains: 'BJ', mode: 'insensitive' } },
              { email: { contains: 'BJ', mode: 'insensitive' } },
              { callname: { contains: 'BJ', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should perform case-insensitive search', async () => {
      const matchedUsers = [mockUsers[0]];
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(1);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(matchedUsers);

      await useCase.execute({ keyword: 'JOHN' });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ mode: 'insensitive' }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should combine keyword search with pagination', async () => {
      const matchedUsers = [mockUsers[0]];
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(15);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(matchedUsers);

      const result = await useCase.execute({
        keyword: 'john',
        page: 2,
        limit: 5,
      });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deleted_at: null,
            OR: [
              { name: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
              { callname: { contains: 'john', mode: 'insensitive' } },
            ],
          },
          skip: 5, // (page 2 - 1) * 5
          take: 5,
        }),
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
      });
    });

    it('should return empty results when no match found', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      const result = await useCase.execute({ keyword: 'nonexistent' });

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should not include search filter when keyword is empty', async () => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(50);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      await useCase.execute({ keyword: '' });

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
        }),
      );
    });
  });
});
