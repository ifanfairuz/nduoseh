import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

export class ErrorInternalResponse {
  constructor(
    message: string = 'Internal server error',
    error: string = 'Internal server error',
  ) {
    this.message = message;
    this.error = error;
  }

  @ApiProperty({
    description: 'Error name',
    example: 'Internal server error',
  })
  error: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Internal server error',
  })
  message: string;
}

export class ErrorForbiddenResponse {
  constructor(message: string = 'Forbidden') {
    this.message = message;
  }

  @ApiProperty({
    description: 'Error name',
    example: 'Forbidden',
  })
  error: string;

  @ApiProperty({ description: 'Error message', example: 'Forbidden' })
  message: string;
}

export class ErrorUnauthorizedResponse {
  constructor(message: string = 'Unauthorized') {
    this.message = message;
  }

  @ApiProperty({
    description: 'Error name',
    example: 'Unauthorized',
  })
  error: string;

  @ApiProperty({ description: 'Error message', example: 'Unauthorized' })
  message: string;
}

export const ApiServerErrorResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ErrorUnauthorizedResponse,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
      type: ErrorForbiddenResponse,
    }),
    ApiResponse({
      status: '5XX',
      description: 'Server error',
      type: ErrorInternalResponse,
    }),
  );
};
