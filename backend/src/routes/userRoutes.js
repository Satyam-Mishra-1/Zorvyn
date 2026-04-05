import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, loadUser, requireRoles } from '../middleware/auth.js';
import { ROLES } from '../constants/roles.js';
import * as userService from '../services/userService.js';
import { handleValidation } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, loadUser);

router.get(
  '/',
  requireRoles(ROLES.ADMIN),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const result = await userService.listUsers({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
    });
    res.json(result);
  })
);

router.get(
  '/:id',
  param('id').isMongoId(),
  handleValidation,
  asyncHandler(async (req, res) => {
    if (req.userRole !== ROLES.ADMIN && req.params.id !== req.userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  })
);

router.post(
  '/',
  requireRoles(ROLES.ADMIN),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('name').isString().trim().notEmpty(),
  body('role').optional().isIn(Object.values(ROLES)),
  body('status').optional().isIn(['active', 'inactive']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body, req.userRole);
    res.status(201).json(user);
  })
);

router.patch(
  '/:id',
  param('id').isMongoId(),
  body('name').optional().isString().trim().notEmpty(),
  body('role').optional().isIn(Object.values(ROLES)),
  body('status').optional().isIn(['active', 'inactive']),
  body('password').optional().isString().isLength({ min: 8 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body, req.userRole, req.userId);
    res.json(user);
  })
);

router.delete(
  '/:id',
  requireRoles(ROLES.ADMIN),
  param('id').isMongoId(),
  handleValidation,
  asyncHandler(async (req, res) => {
    await userService.softDeleteUser(req.params.id, req.userRole);
    res.status(204).send();
  })
);

export default router;
