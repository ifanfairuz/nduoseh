import { Module } from '@nestjs/common';
import { KeyService } from './key.service';
import { CipherService } from './cipher.service';
import { HashService } from './hash.service';

@Module({
  providers: [
    {
      provide: KeyService,
      useFactory: () => new KeyService(),
    },
    CipherService,
    {
      provide: HashService,
      useFactory: () => new HashService('default'),
    },
    {
      provide: 'ACCESS_TOKEN_HASH_SERVICE',
      useFactory: () => new HashService('access-token'),
    },
    {
      provide: 'REFRESH_TOKEN_HASH_SERVICE',
      useFactory: () => new HashService('refresh-token'),
    },
    {
      provide: 'PASSWORD_HASH_SERVICE',
      useFactory: () => new HashService('password'),
    },
  ],
  exports: [
    CipherService,
    HashService,
    'ACCESS_TOKEN_HASH_SERVICE',
    'REFRESH_TOKEN_HASH_SERVICE',
    'PASSWORD_HASH_SERVICE',
  ],
})
export class CipherModule {}
