import { Get, Header, Headers, Inject, Res } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotModifiedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiController } from 'src/utils/http';
import { GetPublicKeyUseCase } from '../use-case/token/get-public-key.use-case';

@ApiController('/.well-known/jwks.json', { tag: 'Token' })
export class JwkController {
  constructor(@Inject() private readonly useCase: GetPublicKeyUseCase) {}

  /**
   * Get jwk public key
   *
   * @returns {Promise<string>}
   */
  @Get()
  @ApiHeader({
    name: 'If-None-Match',
    description: 'etag',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'JWK Public Key',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          example: [
            {
              crv: 'Ed25519',
              x: '...',
              kty: '...',
            },
          ],
        },
      },
    },
  })
  @ApiNotModifiedResponse({
    description: 'Not modified',
  })
  @Header('Cache-Control', 'max-age=86400')
  @Header('Access-Control-Allow-Origin', '*')
  async getJWK(@Res() res: Response, @Headers('If-None-Match') match?: string) {
    if (match && match === this.useCase.etag) {
      return res.status(304).send();
    }

    const { etag, key } = await this.useCase.execute();
    return res.set('ETag', etag).json([key]);
  }
}
