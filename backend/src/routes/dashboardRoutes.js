import { Router } from 'express';
import { query } from 'express-validator';
import { authenticate, loadUser } from '../middleware/auth.js';
import * as dashboardService from '../services/dashboardService.js';
import { handleValidation } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, loadUser);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary();
    res.json(summary);
  })
);

router.get(
  '/trends',
  query('period').optional().isIn(['weekly', 'monthly']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const trends = await dashboardService.getTrends(req.query.period || 'monthly');
    res.json(trends);
  })
);

export default router;
