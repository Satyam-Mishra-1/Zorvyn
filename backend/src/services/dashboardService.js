import { FinancialRecord } from '../models/FinancialRecord.js';
import { RECORD_TYPES } from '../constants/roles.js';

export async function getSummary() {
  const match = { deletedAt: null };

  const [totals, byCategory, recent] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', RECORD_TYPES.INCOME] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', RECORD_TYPES.EXPENSE] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]),
    FinancialRecord.find(match)
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name email')
      .lean(),
  ]);

  const t = totals[0] || { totalIncome: 0, totalExpense: 0, count: 0 };
  const netBalance = (t.totalIncome || 0) - (t.totalExpense || 0);

  return {
    totalIncome: t.totalIncome || 0,
    totalExpenses: t.totalExpense || 0,
    netBalance,
    recordCount: t.count || 0,
    categoryBreakdown: byCategory.map((c) => ({
      category: c._id.category,
      type: c._id.type,
      total: c.total,
    })),
    recentActivity: recent.map((r) => ({
      id: r._id,
      amount: r.amount,
      type: r.type,
      category: r.category,
      date: r.date,
      notes: r.notes,
      createdBy: r.createdBy
        ? { name: r.createdBy.name, email: r.createdBy.email }
        : null,
    })),
  };
}

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getTrends(period = 'monthly') {
  const match = { deletedAt: null };
  const now = new Date();

  let groupBy;
  let cursor;
  if (period === 'weekly') {
    cursor = startOfWeek(now);
    cursor.setDate(cursor.getDate() - 7 * 11);
    match.date = { $gte: cursor };
    groupBy = {
      year: { $year: '$date' },
      week: { $week: '$date' },
    };
  } else {
    cursor = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    match.date = { $gte: cursor };
    groupBy = {
      year: { $year: '$date' },
      month: { $month: '$date' },
    };
  }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: groupBy,
        income: {
          $sum: { $cond: [{ $eq: ['$type', RECORD_TYPES.INCOME] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', RECORD_TYPES.EXPENSE] }, '$amount', 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } },
  ];

  const rows = await FinancialRecord.aggregate(pipeline);

  return {
    period: period === 'weekly' ? 'weekly' : 'monthly',
    points: rows.map((r) => ({
      label:
        period === 'weekly'
          ? `${r._id.year}-W${String(r._id.week).padStart(2, '0')}`
          : `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      income: r.income,
      expense: r.expense,
      net: r.income - r.expense,
    })),
  };
}
