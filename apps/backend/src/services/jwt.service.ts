import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { TokenPayload } from '../types/user.types';

export class JWTService {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as any);
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as any);
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  }
}

export const jwtService = new JWTService();
