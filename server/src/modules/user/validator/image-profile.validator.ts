import { FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

export interface ImageProfileValidatorOptions {
  optional?: boolean;
}

export class ImageProfileValidator extends FileValidator {
  constructor(protected config?: ImageProfileValidatorOptions) {
    super({});
  }

  isValid(file?: IFile | IFile[]): boolean | Promise<boolean> {
    if (!file) {
      if (this.config?.optional) return true;
      return false;
    }

    if (Array.isArray(file)) {
      return false;
    }

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return false;
    }

    if (file.size > 5_000_000) {
      return false;
    }

    return true;
  }

  buildErrorMessage(): string {
    return 'File must be a jpeg or png image and less than 5MB';
  }
}
