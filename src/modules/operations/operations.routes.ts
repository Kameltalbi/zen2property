import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  convertMaintenanceToExpense,
  createExpense,
  createMaintenance,
  deleteExpense,
  deleteMaintenance,
  expenseSchema,
  expenseUpdateSchema,
  listExpenses,
  listMaintenance,
  maintenanceSchema,
  maintenanceUpdateSchema,
  updateExpense,
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

operationsRouter.patch('/expenses/:id', validate(expenseUpdateSchema), asyncHandler(async (req, res) => {
  res.json({ expense: await updateExpense(req.user!.id, req.params.id, req.body) });
}));

operationsRouter.delete('/expenses/:id', asyncHandler(async (req, res) => {
  await deleteExpense(req.user!.id, req.params.id);
  res.status(204).end();
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

operationsRouter.delete('/maintenance/:id', asyncHandler(async (req, res) => {
  await deleteMaintenance(req.user!.id, req.params.id);
  res.status(204).end();
}));

operationsRouter.post('/maintenance/:id/expense', asyncHandler(async (req, res) => {
  const currency = typeof req.body?.currency === 'string' ? req.body.currency : undefined;
  res.status(201).json({ expense: await convertMaintenanceToExpense(req.user!.id, req.params.id, currency) });
}));
