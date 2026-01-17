import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  ModuleMetadata,
  NestModule,
  Provider,
} from '@nestjs/common';
import { CipherModule } from 'src/services/cipher/cipher.module';
import { JwtService } from './services/jwt.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { AccessTokenService } from './services/access-token.service';
import { AccessTokenRepository } from './repositories/access-token.repository';
import { AccountRepository } from './repositories/account.repository';
import { AuthProviderClientIdRepository } from './repositories/auth-provider-client-id.repository';
import { AuthSessionRepository } from './repositories/auth-session.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UserRepository } from './repositories/user.repository';
import { UserConfig } from './config';
import { LoginPasswordUseCase } from './use-case/login/login-password.use-case';
import { LoginUserUseCase } from './use-case/login/login-user.use-case';
import { GetPublicKeyUseCase } from './use-case/token/get-public-key.use-case';
import { RefreshTokenUseCase } from './use-case/token/refresh-token.use-case';
import { VerifyTokenUseCase } from './use-case/token/verify-token.use-case';
import { VerifyTokenRemoteUseCase } from './use-case/token/verify-token-remote.use-case';
import { VerifyTokenLocalUseCase } from './use-case/token/verify-token-local.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { AuthController } from './controller/auth.controller';
import { JwkController } from './controller/jwk.controller';
import { LogoutController } from './controller/logout.controller';
import { MeController } from './controller/me.controller';
import { GetMeUseCase } from './use-case/me/get-me.user.use-case';
import { UpdateMeUseCase } from './use-case/me/update.me.use-case';
import { TokenController } from './controller/token.controller';
import { UserImageDisk } from './storage/user-image.disk';
import { LocalStorageService } from 'src/services/storage/local-storage.service';
import { UpdateImageMeUseCase } from './use-case/me/update-image.me.use-case';
import { AuthMiddleware } from './auth.middleware';
import { getServerName } from 'src/utils/server';
import { ListUsersUseCase } from './use-case/user/list-users.use-case';
import { GetUserByIdUseCase } from './use-case/user/get-user-by-id.use-case';
import { CreateUserUseCase } from './use-case/user/create-user.use-case';
import { UpdateUserUseCase } from './use-case/user/update-user.use-case';
import { DeleteUserUseCase } from './use-case/user/delete-user.use-case';
import { UsersController } from './controller/users.controller';

function genMetadata(config: UserConfig): ModuleMetadata {
  const verifyTokenProvider: Provider = {
    provide: VerifyTokenUseCase,
    useClass: config.auth.remote_auth
      ? VerifyTokenRemoteUseCase
      : VerifyTokenLocalUseCase,
  };

  return {
    imports: [CipherModule],
    providers: [
      // config
      {
        provide: 'USER_CONFIG',
        useValue: config,
      },
      {
        provide: 'USER_IMAGE_STORAGE_DRIVER',
        useExisting: LocalStorageService,
      },

      // services
      JwtService,
      AccessTokenService,
      RefreshTokenService,
      UserImageDisk,

      // repositories
      AccessTokenRepository,
      AccountRepository,
      AuthProviderClientIdRepository,
      AuthSessionRepository,
      RefreshTokenRepository,
      UserRepository,

      // use-cases
      LoginUserUseCase,
      LoginPasswordUseCase,
      GetPublicKeyUseCase,
      RefreshTokenUseCase,
      verifyTokenProvider,
      LogoutUseCase,
      GetMeUseCase,
      UpdateMeUseCase,
      UpdateImageMeUseCase,
      ListUsersUseCase,
      GetUserByIdUseCase,
      CreateUserUseCase,
      UpdateUserUseCase,
      DeleteUserUseCase,
    ],
    exports: [
      // exported modules
      CipherModule,

      // exported services
      UserImageDisk,

      // exported repositories
      AccessTokenRepository,
      AccountRepository,
      AuthProviderClientIdRepository,
      AuthSessionRepository,
      RefreshTokenRepository,
      UserRepository,

      // use-cases
      LoginUserUseCase,
      LoginPasswordUseCase,
      GetPublicKeyUseCase,
      RefreshTokenUseCase,
      VerifyTokenUseCase,
      LogoutUseCase,
      GetMeUseCase,
      UpdateMeUseCase,
      UpdateImageMeUseCase,
    ],
    controllers: [
      AuthController,
      JwkController,
      TokenController,
      LogoutController,
      MeController,
      UsersController,
    ],
  };
}

@Global()
@Module({})
export class UserModule implements NestModule {
  static permissions = [
    'users.list',
    'users.create',
    'users.update',
    'users.delete',
  ];

  static defaultConfig: UserConfig = {
    auth: {
      remote_auth: process.env.REMOTE_AUTH_URL,
      server_name: getServerName(),
      access_token_duration: { minutes: 10 },
      refresh_token_duration: { days: 10 },
    },
  };

  static configure(options?: {
    auth?: Partial<UserConfig['auth']>;
  }): DynamicModule {
    const metadata = genMetadata({
      ...UserModule.defaultConfig,
      ...options,
      auth: {
        ...UserModule.defaultConfig.auth,
        ...options?.auth,
      },
    });

    return {
      global: true,
      module: UserModule,
      ...metadata,
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('/api/auth/token/refresh', '/api/auth/:provider/login')
      .forRoutes('/api/*all');
  }
}
