import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from './errorHandler.js';
import { USER_STATUS } from '../constants/roles.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export async function loadUser(req, res, next) {
  if (!req.userId) return next();
  const user = await User.findById(req.userId).select('+passwordHash');
  if (!user || user.deletedAt) {
    return next(new AppError('User not found', 401));
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    return next(new AppError('Account is inactive', 403));
  }
  req.user = user;
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
