import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { emailReceipt, emailReceiptSchema, getReceipt, listReceipts } from './receipts.service';

export const receiptsRouter = Router();
receiptsRouter.use(requireAuth);

receiptsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ receipts: await listReceipts(req.user!.id) });
  }),
);

receiptsRouter.post(
  '/:id/email',
  validate(emailReceiptSchema),
  asyncHandler(async (req, res) => {
    res.json(await emailReceipt(req.user!.id, req.params.id, req.body));
  }),
);

receiptsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const receipt = await getReceipt(req.user!.id, req.params.id);
    res.json({
      receipt: {
        id: receipt.id,
        paymentId: receipt.payment_id,
        number: receipt.number,
        legalProfileId: receipt.legal_profile_id,
        issuedAt: receipt.issued_at,
      },
    });
  }),
);

receiptsRouter.get(
  '/:id/pdf',
  asyncHandler(async (req, res) => {
    const receipt = await getReceipt(req.user!.id, req.params.id);
    res.download(receipt.pdf_path, `receipt-${receipt.number}.pdf`);
  }),
);
