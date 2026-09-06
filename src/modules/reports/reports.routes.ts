import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../lib/asyncHandler';
import { expenseReportCsv, propertySummaryCsv, rentReportCsv } from './reports.service';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

function sendCsv(res: import('express').Response, filename: string, csv: string): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

reportsRouter.get(
  '/rent.csv',
  asyncHandler(async (req, res) => {
    const report = await rentReportCsv(req.user!.id);
    sendCsv(res, report.filename, report.csv);
  }),
);

reportsRouter.get(
  '/expenses.csv',
  asyncHandler(async (req, res) => {
    const report = await expenseReportCsv(req.user!.id);
    sendCsv(res, report.filename, report.csv);
  }),
);

reportsRouter.get(
  '/properties.csv',
  asyncHandler(async (req, res) => {
    const report = await propertySummaryCsv(req.user!.id);
    sendCsv(res, report.filename, report.csv);
  }),
);
