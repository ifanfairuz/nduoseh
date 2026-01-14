import { ErrorValidationException } from "./error-validation.exception";

export interface PasswordValidationErrorMap {
  MIN_PASSWORD_LENGTH: [length: number];
  MAX_PASSWORD_LENGTH: [length: number];
  PASSWORD_FORMAT: [allow_chars: string];
  INVALID_PASSWORD: [];
}

export class PasswordValidationException<
  K extends keyof PasswordValidationErrorMap = keyof PasswordValidationErrorMap,
  A = PasswordValidationErrorMap[K],
> extends ErrorValidationException<PasswordValidationErrorMap, K, A> {
  public constructor(message: string, code: K, args: A = [] as A) {
    super(message, code, "password", args);
  }
}

const PASSWORD_REGEX = new RegExp(
  "^[a-zA-Z0-9!@#$%^&*()-_+={}\\[\\]\\|\\:;'\",<>.\\/?~]+$"
);

/**
 * Validate password
 *
 * @param {string} password
 * @returns {string}
 * @throws {PasswordValidationException}
 */
export function validatePassword(password: string) {
  if (password.length < 8) {
    throw new PasswordValidationException(
      "Password must be at least 8 characters",
      "MIN_PASSWORD_LENGTH",
      [password.length]
    ) as Error;
  }

  if (password.length > 30) {
    throw new PasswordValidationException(
      "Password must be at most 30 characters",
      "MAX_PASSWORD_LENGTH",
      [password.length]
    ) as Error;
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new PasswordValidationException(
      "Password must be alphanumeric and special characters",
      "PASSWORD_FORMAT",
      ["!@#$%^&*()-_+={}\\[]|:;'\",<>./?~"]
    ) as Error;
  }

  return password;
}
