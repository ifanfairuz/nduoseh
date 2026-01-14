import type { LoginResponse, TokenResponse } from '@panah/contract';
import { UserResponse } from './user.response';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  constructor(payload: LoginResponse) {
    this.access_token = payload.access_token;
    this.refresh_token = payload.refresh_token;
    this.user = new UserResponse(payload.user);
  }

  // static async withImageUrl(
  //   payload: LoginResponse,
  //   storage: UserImageStorage,
  // ) {
  //   const response = new AuthResponse(payload);
  //   response.user = await UserResponse.withImageUrl(payload.user, storage);
  //   return response;
  // }

  @ApiProperty({
    description: 'JWT Access Token',
    example: { token: 'eyJhbG.....', expires_at: 1677721600 },
  })
  access_token: TokenResponse;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: { token: '.....', expires_at: 1677721600 },
  })
  refresh_token: TokenResponse;

  @ApiProperty({
    description: 'User information',
    example: UserResponse.example,
  })
  user: UserResponse;
}
