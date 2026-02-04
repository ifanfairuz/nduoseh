import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
  HttpException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErrorValidationResponse } from './utils/validation/error-validation.response';
import { ErrorValidationException } from './utils/validation';
import {
  ErrorForbiddenResponse,
  ErrorInternalResponse,
  ErrorUnauthorizedResponse,
} from './utils/http/error.response';
import { ErrorTokenException } from './modules/user/exceptions/ErrorTokenException';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  /**
   * Determine if the request is in JSON format
   *
   * @param {Request} req
   * @returns {boolean}
   */
  private wantJson(req: Request) {
    return req.get('accept') === 'application/json';
  }

  /**
   * Generate validation error response
   *
   * @param {ZodError} error
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  private genZodValidationRespose(
    error: ZodError,
    req: Request,
    res: Response,
  ) {
    if (!this.wantJson(req)) {
      return res.status(HttpStatus.BAD_REQUEST).send('Bad Request');
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(ErrorValidationResponse.fromZodIssues(error.issues));
  }

  /**
   * Generate validation error response
   *
   * @param {ZodError} error
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  private genValidationRespose(
    error: ErrorValidationException,
    req: Request,
    res: Response,
  ) {
    if (!this.wantJson(req)) {
      return res.status(HttpStatus.BAD_REQUEST).send('Bad Request');
    }

    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(ErrorValidationResponse.fromErrorValidation(error));
  }

  /**
   * Generate http exception response
   *
   * @param {HttpException} exception
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  private genHttpExceptionRespose(
    exception: HttpException,
    req: Request,
    res: Response,
  ) {
    if (!this.wantJson(req)) {
      return res.status(exception.getStatus()).send(exception.message);
    }

    if (exception instanceof ForbiddenException) {
      return res
        .status(exception.getStatus())
        .json(new ErrorForbiddenResponse());
    }

    if (exception instanceof UnauthorizedException) {
      return res
        .status(exception.getStatus())
        .json(new ErrorUnauthorizedResponse());
    }

    return res
      .status(exception.getStatus())
      .json(new ErrorInternalResponse(exception.message, exception.name));
  }

  /**
   * Generate default error response
   *
   * @param {Request} req
   * @param {Response} res
   * @returns {Response}
   */
  private genDefaultErrorRespose(req: Request, res: Response) {
    if (!this.wantJson(req)) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(new ErrorInternalResponse());
  }

  /**
   * Handle log error
   *
   * @param {HttpException} exception
   */
  private handleLogError(exception: HttpException) {
    const status = exception.getStatus();
    if (status >= 400 && status <= 499) {
      this.logger.warn(exception);
    } else {
      this.logger.error('Error Exception', exception);
    }
  }

  /**
   * Catch error
   *
   * @param {Error} exception
   * @param {ArgumentsHost} host
   * @returns {Response}
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // handle auth error
    if (exception instanceof ErrorTokenException) {
      return this.genHttpExceptionRespose(
        new UnauthorizedException(),
        request,
        response,
      );
    }

    // handle validation error
    if (exception instanceof ZodError) {
      this.logger.debug(exception);
      return this.genZodValidationRespose(exception, request, response);
    }
    if (exception instanceof ErrorValidationException) {
      this.logger.debug(exception);
      return this.genValidationRespose(
        exception as ErrorValidationException,
        request,
        response,
      );
    }

    // handle known exceptions
    if (exception instanceof HttpException) {
      this.handleLogError(exception);
      return this.genHttpExceptionRespose(exception, request, response);
    }

    // handle default error
    this.logger.error('Error Exception', exception, exception.stack);
    return this.genDefaultErrorRespose(request, response);
  }
}
