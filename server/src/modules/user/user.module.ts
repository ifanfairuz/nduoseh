import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
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
import defaultConfig, { UserConfig } from './config';
import { LoginPasswordUseCase } from './use-case/login/login-password.use-case';
import { LoginUserUseCase } from './use-case/login/login-user.use-case';
import { RegisterUseCase } from './use-case/register/register.use-case';
import { RegisterPasswordUseCase } from './use-case/register/register-password.use-case';
import { GetPublicKeyUseCase } from './use-case/token/get-public-key.use-case';
import { RefreshTokenUseCase } from './use-case/token/refresh-token.use-case';
import { VerifyTokenUseCase } from './use-case/token/verify-token.use-case';
import { VerifyTokenRemoteUseCase } from './use-case/token/verify-token-remote.use-case';
import { VerifyTokenLocalUseCase } from './use-case/token/verify-token-local.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { AuthController } from './controller/auth.controller';
import { JwkController } from './controller/jwk.controller';
import { LogoutController } from './controller/logout.controller';
import { UserController } from './controller/user.controller';
import { GetUserUseCase } from './use-case/user/get.user.use-case';
import { UpdateUserUseCase } from './use-case/user/update.user.use-case';
import { TokenController } from './controller/token.controller';

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

      // services
      JwtService,
      AccessTokenService,
      RefreshTokenService,

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
      RegisterUseCase,
      RegisterPasswordUseCase,
      GetPublicKeyUseCase,
      RefreshTokenUseCase,
      verifyTokenProvider,
      LogoutUseCase,
      GetUserUseCase,
      UpdateUserUseCase,
    ],
    exports: [
      // exported modules
      CipherModule,

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
      RegisterUseCase,
      RegisterPasswordUseCase,
      GetPublicKeyUseCase,
      RefreshTokenUseCase,
      VerifyTokenUseCase,
      LogoutUseCase,
      GetUserUseCase,
      UpdateUserUseCase,
    ],
    controllers: [
      AuthController,
      JwkController,
      TokenController,
      LogoutController,
      UserController,
    ],
  };
}

@Global()
@Module(genMetadata(defaultConfig))
export class UserModule {
  static withOptions(options: UserConfig): DynamicModule {
    const metadata = genMetadata(options);

    return {
      global: true,
      module: UserModule,
      ...metadata,
    };
  }
}
