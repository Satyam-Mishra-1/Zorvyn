import mongoose from 'mongoose';
import { FinancialRecord } from '../models/FinancialRecord.js';
import { AppError } from '../middleware/errorHandler.js';
import { RECORD_TYPES } from '../constants/roles.js';

function baseFilter() {
  return { deletedAt: null };
}

export async function createRecord(data, userId) {
  const doc = await FinancialRecord.create({
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: new Date(data.date),
    notes: data.notes ?? '',
    createdBy: userId,
  });
  return serialize(doc);
}

export async function getRecordById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid record id', 400);
  }
  const doc = await FinancialRecord.findOne({ _id: id, ...baseFilter() }).populate(
    'createdBy',
    'name email'
  );
  if (!doc) throw new AppError('Record not found', 404);
  return serialize(doc);
}

export async function listRecords(query) {
  const {
    page = 1,
    limit = 20,
    dateFrom,
    dateTo,
    category,
    type,
    search,
    sort = 'date',
    order = 'desc',
  } = query;

  const filter = { ...baseFilter() };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (type) {
    if (!Object.values(RECORD_TYPES).includes(type)) {
      throw new AppError('Invalid type filter', 400);
    }
    filter.type = type;
  }
  const q = typeof search === 'string' ? search.trim() : '';
  if (q) {
    filter.$text = { $search: q };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortField = ['date', 'amount', 'createdAt'].includes(sort) ? sort : 'date';
  const sortDir = order === 'asc' ? 1 : -1;

  const sortSpec = q ? { score: { $meta: 'textScore' } } : { [sortField]: sortDir };
  const [items, total] = await Promise.all([
    FinancialRecord.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .lean(),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    data: items.map(serializeLean),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function updateRecord(id, data, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid record id', 400);
  }
  const doc = await FinancialRecord.findOne({ _id: id, ...baseFilter() });
  if (!doc) throw new AppError('Record not found', 404);

  if (data.amount !== undefined) doc.amount = data.amount;
  if (data.type !== undefined) doc.type = data.type;
  if (data.category !== undefined) doc.category = data.category;
  if (data.date !== undefined) doc.date = new Date(data.date);
  if (data.notes !== undefined) doc.notes = data.notes;

  await doc.save();
  return serialize(doc);
}

export async function softDeleteRecord(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid record id', 400);
  }
  const doc = await FinancialRecord.findOne({ _id: id, ...baseFilter() });
  if (!doc) throw new AppError('Record not found', 404);
  doc.deletedAt = new Date();
  await doc.save();
  return { success: true };
}

function serialize(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return serializeLean(o);
}

function serializeLean(o) {
  return {
    id: o._id,
    amount: o.amount,
    type: o.type,
    category: o.category,
    date: o.date,
    notes: o.notes,
    createdBy: o.createdBy
      ? typeof o.createdBy === 'object'
        ? { id: o.createdBy._id, name: o.createdBy.name, email: o.createdBy.email }
        : o.createdBy
      : undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
