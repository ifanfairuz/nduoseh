import { VerifiedToken } from '@nduoseh/contract';
import { Request } from 'express';

export interface AuthRequest extends Request {
  access_token?: VerifiedToken;
}

export interface AuthedRequest extends AuthRequest {
  access_token: VerifiedToken;
}
