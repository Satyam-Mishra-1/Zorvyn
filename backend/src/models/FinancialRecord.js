import mongoose from 'mongoose';
import { RECORD_TYPES } from '../constants/roles.js';

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(RECORD_TYPES),
      required: true,
    },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

financialRecordSchema.index({ date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ type: 1 });
financialRecordSchema.index({ deletedAt: 1 });
financialRecordSchema.index({ notes: 'text', category: 'text' });

export const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema);
