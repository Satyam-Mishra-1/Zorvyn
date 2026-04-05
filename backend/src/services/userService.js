import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';

export async function listUsers({ page = 1, limit = 20, search = '' }) {
  const q = { deletedAt: null };
  if (search) {
    q.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(q),
  ]);
  return {
    data: items.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getUserById(id) {
  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user.toObject());
}

function sanitizeUser(u) {
  return {
    id: u._id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function createUser(payload, actorRole) {
  if (actorRole !== ROLES.ADMIN) {
    throw new AppError('Only admins can create users', 403);
  }
  const email = payload.email.toLowerCase();
  const exists = await User.findOne({ email, deletedAt: null });
  if (exists) throw new AppError('Email already in use', 409);
  const passwordHash = await User.hashPassword(payload.password);
  const user = await User.create({
    email,
    passwordHash,
    name: payload.name,
    role: payload.role || ROLES.VIEWER,
    status: payload.status || USER_STATUS.ACTIVE,
  });
  return sanitizeUser(user.toObject());
}

export async function updateUser(id, payload, actorRole, actorId) {
  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw new AppError('User not found', 404);

  const isSelf = actorId.toString() === id.toString();
  if (actorRole !== ROLES.ADMIN && !isSelf) {
    throw new AppError('Forbidden', 403);
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (actorRole === ROLES.ADMIN) {
    if (payload.status !== undefined) user.status = payload.status;
    if (payload.role !== undefined) user.role = payload.role;
    if (payload.password) user.passwordHash = await User.hashPassword(payload.password);
  }

  await user.save();
  return sanitizeUser(user.toObject());
}

export async function softDeleteUser(id, actorRole) {
  if (actorRole !== ROLES.ADMIN) {
    throw new AppError('Only admins can delete users', 403);
  }
  const user = await User.findOne({ _id: id, deletedAt: null });
  if (!user) throw new AppError('User not found', 404);
  user.deletedAt = new Date();
  user.status = USER_STATUS.INACTIVE;
  await user.save();
  return { success: true };
}
