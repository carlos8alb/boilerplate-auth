import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { TokenPayload } from '../types/user.types';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwtService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
