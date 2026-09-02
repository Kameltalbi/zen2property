import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  convertMaintenanceToExpense,
  createExpense,
  createMaintenance,
  expenseSchema,
  listExpenses,
  listMaintenance,
  maintenanceSchema,
  maintenanceUpdateSchema,
  updateMaintenance,
} from './operations.service';

export const operationsRouter = Router();
operationsRouter.use(requireAuth);

operationsRouter.get('/expenses', asyncHandler(async (req, res) => {
  res.json({ expenses: await listExpenses(req.user!.id) });
}));

operationsRouter.post('/expenses', validate(expenseSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ expense: await createExpense(req.user!.id, req.body) });
}));

operationsRouter.get('/maintenance', asyncHandler(async (req, res) => {
  res.json({ maintenance: await listMaintenance(req.user!.id) });
}));

operationsRouter.post('/maintenance', validate(maintenanceSchema), asyncHandler(async (req, res) => {
  res.status(201).json({ maintenance: await createMaintenance(req.user!.id, req.body) });
}));

operationsRouter.patch('/maintenance/:id', validate(maintenanceUpdateSchema), asyncHandler(async (req, res) => {
  res.json({ maintenance: await updateMaintenance(req.user!.id, req.params.id, req.body) });
}));

operationsRouter.post('/maintenance/:id/expense', asyncHandler(async (req, res) => {
  res.status(201).json({ expense: await convertMaintenanceToExpense(req.user!.id, req.params.id, String(req.body.currency ?? 'EUR')) });
}));
