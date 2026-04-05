import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, loadUser, requireRoles } from '../middleware/auth.js';
import { ROLES, RECORD_TYPES } from '../constants/roles.js';
import * as recordService from '../services/recordService.js';
import { handleValidation } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, loadUser, requireRoles(ROLES.ADMIN, ROLES.ANALYST));

router.get(
  '/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('category').optional().isString(),
  query('type').optional().isIn(Object.values(RECORD_TYPES)),
  query('search').optional().isString(),
  query('sort').optional().isIn(['date', 'amount', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const result = await recordService.listRecords(req.query);
    res.json(result);
  })
);

router.get(
  '/:id',
  param('id').isMongoId(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const record = await recordService.getRecordById(req.params.id);
    res.json(record);
  })
);

router.use(requireRoles(ROLES.ADMIN));

router.post(
  '/',
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(Object.values(RECORD_TYPES)),
  body('category').isString().trim().notEmpty(),
  body('date').isISO8601(),
  body('notes').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const record = await recordService.createRecord(req.body, req.userId);
    res.status(201).json(record);
  })
);

router.patch(
  '/:id',
  param('id').isMongoId(),
  body('amount').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(Object.values(RECORD_TYPES)),
  body('category').optional().isString().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('notes').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const record = await recordService.updateRecord(req.params.id, req.body, req.userId);
    res.json(record);
  })
);

router.delete(
  '/:id',
  param('id').isMongoId(),
  handleValidation,
  asyncHandler(async (req, res) => {
    await recordService.softDeleteRecord(req.params.id);
    res.status(204).send();
  })
);

export default router;
