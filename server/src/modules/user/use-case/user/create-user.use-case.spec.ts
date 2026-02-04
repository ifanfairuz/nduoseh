/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../repositories/user.repository';
import { AccountRepository } from '../../repositories/account.repository';
import { HashService } from 'src/services/cipher/hash.service';
import { PrismaAtomicService } from 'src/services/prisma/atomic.service';
import { UserImageDisk } from '../../storage/user-image.disk';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let atomic: PrismaAtomicService;
  let userRepository: UserRepository;
  let accountRepository: AccountRepository;
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: PrismaAtomicService,
          useValue: {
            tx: jest.fn().mockImplementation((callback) => callback({})),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: AccountRepository,
          useValue: {
            createAccountWithPassword: jest.fn(),
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

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    atomic = module.get<PrismaAtomicService>(PrismaAtomicService);
    userRepository = module.get<UserRepository>(UserRepository);
    accountRepository = module.get<AccountRepository>(AccountRepository);
    hashService = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      callname: 'JD',
    };

    const hashedPassword = 'hashed_password_123';
    const createdUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      email_verified: false,
      image: null,
      callname: 'JD',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should create a new user successfully with callname', async () => {
      const mockTx: any = {};
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      const mockAccount = {
        id: 'account-1',
        user_id: createdUser.id,
        provider: 'password',
      };
      jest
        .spyOn(accountRepository, 'createAccountWithPassword')
        .mockResolvedValue(mockAccount as any);

      const result = await useCase.execute(createUserDto);

      expect(atomic.tx).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: createUserDto.name,
          email: createUserDto.email,
          callname: createUserDto.callname,
        },
        { tx: mockTx },
      );
      expect(hashService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(accountRepository.createAccountWithPassword).toHaveBeenCalledWith(
        {
          user_id: createdUser.id,
          password: hashedPassword,
        },
        { tx: mockTx },
      );
      expect(result).toEqual({ ...createdUser, image: undefined });
    });

    it('should create user with default callname from name when not provided', async () => {
      const dtoWithoutCallname = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const mockTx: any = {};
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      const mockAccount = {
        id: 'account-1',
        user_id: createdUser.id,
        provider: 'password',
      };
      jest
        .spyOn(accountRepository, 'createAccountWithPassword')
        .mockResolvedValue(mockAccount as any);

      await useCase.execute(dtoWithoutCallname);

      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: dtoWithoutCallname.name,
          email: dtoWithoutCallname.email,
          callname: 'Jane Doe',
        },
        { tx: mockTx },
      );
    });

    it('should truncate callname to 20 characters when derived from name', async () => {
      const dtoWithLongName = {
        name: 'This is a very long name that exceeds twenty characters',
        email: 'longname@example.com',
        password: 'password123',
      };

      const mockTx: any = {};
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      const mockAccount = {
        id: 'account-1',
        user_id: createdUser.id,
        provider: 'password',
      };
      jest
        .spyOn(accountRepository, 'createAccountWithPassword')
        .mockResolvedValue(mockAccount as any);

      await useCase.execute(dtoWithLongName);

      expect(userRepository.create).toHaveBeenCalledWith(
        {
          name: dtoWithLongName.name,
          email: dtoWithLongName.email,
          callname: 'This is a very long ',
        },
        { tx: mockTx },
      );
    });

    it('should execute within a transaction', async () => {
      const mockTx: any = {};
      jest
        .spyOn(atomic, 'tx')
        .mockImplementation((callback) => callback(mockTx));
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser);
      jest.spyOn(hashService, 'hash').mockResolvedValue(hashedPassword);
      const mockAccount = {
        id: 'account-1',
        user_id: createdUser.id,
        provider: 'password',
      };
      jest
        .spyOn(accountRepository, 'createAccountWithPassword')
        .mockResolvedValue(mockAccount as any);

      await useCase.execute(createUserDto);

      expect(atomic.tx).toHaveBeenCalledTimes(1);
      expect(atomic.tx).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
