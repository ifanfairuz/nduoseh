import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { $ZodIssue } from 'zod/v4/core';
import { ErrorValidationException } from '.';

export class ErrorValidationResponse {
  constructor(message: string, issues: Record<string, string> = {}) {
    this.message = message;
    this.issues = issues;
  }

  public static fromZodIssues(issues: $ZodIssue[]): ErrorValidationResponse {
    return new ErrorValidationResponse(
      issues[0].message,
      issues.reduce<Record<string, string>>((issues, issue) => {
        issues[issue.path.join('.')] = issue.message;
        return issues;
      }, {}),
    );
  }

  public static fromErrorValidation(
    error: ErrorValidationException,
  ): ErrorValidationResponse {
    return new ErrorValidationResponse(error.message, {
      [error.type]: error.message,
    });
  }

  @ApiProperty({
    description: 'Error name',
    example: 'Validation Error',
    enum: ['Validation Error'],
  })
  error = 'Validation Error';

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid email',
  })
  message: string;

  @ApiProperty({ description: 'Issues', example: { email: 'Invalid email' } })
  issues: Record<string, string>;
}

export const ApiValidationResponse = () => {
  return ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorValidationResponse,
  });
};
