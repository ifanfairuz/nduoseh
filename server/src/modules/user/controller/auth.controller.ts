import { Body, HttpCode, Inject, Ip, Post } from '@nestjs/common';
import {
  ApiController,
  ApiResponse,
  DeviceId,
  UserAgent,
} from 'src/utils/http';
import {
  PasswordValidationException,
  validatePassword,
  Validation,
} from 'src/utils/validation';
import z from 'zod';
import { LoginPasswordUseCase } from '../use-case/login/login-password.use-case';
import { RegisterPasswordUseCase } from '../use-case/register/register-password.use-case';
import { AuthResponse } from '../response/auth.response';

const RegisterBody = z.object({
  email: z.email('Invalid email'),
  name: z.string("Name can't be empty").min(1, "Name can't be empty").max(255),
  image: z.string("Name can't be empty").optional(),
  password: z.string().superRefine((_password, ctx) => {
    try {
      validatePassword(_password);
    } catch (error) {
      if (error instanceof PasswordValidationException) {
        ctx.addIssue({
          code: 'custom',
          message: error.message,
        });
      }
    }
  }),
});

const LoginBody = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Invalid password'),
});

@ApiController('auth/password', { tag: 'Auth' })
export class AuthController {
  constructor(
    @Inject() private readonly loginUseCase: LoginPasswordUseCase,
    @Inject() private readonly registerUseCase: RegisterPasswordUseCase,
  ) {}
  /**
   * Register user with password
   *
   * @param {RegisterPasswordAuthUseCase} useCase
   * @param {z.infer<typeof RegisterBody>} body
   * @returns {Promise<string>}
   */
  @Post('register')
  @HttpCode(201)
  @Validation(RegisterBody)
  @ApiResponse(AuthResponse, { status: 201 })
  async registerWithPassword(
    @Body() body: z.infer<typeof RegisterBody>,
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
  ) {
    const res = await this.registerUseCase.execute(
      {
        email: body.email,
        name: body.name,
        image: body.image,
        email_verified: false,
      },
      body.password,
      {
        ip_address,
        user_agent,
        device_id,
      },
    );

    return new AuthResponse(res);
  }

  /**
   * Login user with password
   *
   * @param {LoginBody} body
   * @returns {Promise<string>}
   */
  @Post('login')
  @HttpCode(200)
  @Validation(LoginBody)
  @ApiResponse(AuthResponse, { status: 200 })
  async loginWithPassword(
    @Body() body: z.infer<typeof LoginBody>,
    @Ip() ip_address: string,
    @UserAgent() user_agent: string,
    @DeviceId() device_id: string,
  ) {
    const payload = await this.loginUseCase.execute({
      email: body.email,
      password: body.password,
      client: {
        ip_address,
        user_agent,
        device_id,
      },
    });

    return new AuthResponse(payload);
  }
}
