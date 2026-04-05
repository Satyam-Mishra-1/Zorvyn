import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { USER_STATUS, ROLES } from '../constants/roles.js';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select(
    '+passwordHash'
  );
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError('Account is inactive', 403);
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  };
}

export async function register({ email, password, name }) {
  if (process.env.ALLOW_PUBLIC_REGISTER !== 'true') {
    throw new AppError('Public registration is disabled', 403);
  }
  const exists = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (exists) {
    throw new AppError('Email already registered', 409);
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
  });
  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  };
}
