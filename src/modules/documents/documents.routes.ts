import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import { HttpError } from '../../lib/httpError';
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  createDocument,
  createDocumentMetaSchema,
  deleteDocument,
  getDocument,
  getDocumentFile,
  listDocuments,
} from './documents.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_DOCUMENT_TYPES.has(file.mimetype)) {
      cb(new HttpError(415, 'This file type is not allowed.'));
      return;
    }
    cb(null, true);
  },
});

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

const listQuery = z.object({
  propertyId: z.string().uuid().optional(),
  category: z.string().optional(),
});

documentsRouter.get(
  '/',
  validate(listQuery, 'query'),
  asyncHandler(async (req, res) => {
    res.json({
      documents: await listDocuments(req.user!.id, {
        propertyId: req.query.propertyId as string | undefined,
        category: req.query.category as string | undefined,
      }),
    });
  }),
);

documentsRouter.post(
  '/',
  (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err) next(err instanceof HttpError ? err : new HttpError(400, 'Invalid upload'));
      else next();
    });
  },
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new HttpError(400, 'A file is required.');
    const parsed = createDocumentMetaSchema.safeParse({
      propertyId: req.body.propertyId || undefined,
      tenantId: req.body.tenantId || undefined,
      leaseId: req.body.leaseId || undefined,
      category: req.body.category || 'OTHER',
      title: req.body.title,
      expiresAt: req.body.expiresAt || undefined,
      notes: req.body.notes || undefined,
    });
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues.map((i) => i.message).join('; '));
    }
    const document = await createDocument(req.user!.id, parsed.data, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
    res.status(201).json({ document });
  }),
);

documentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ document: await getDocument(req.user!.id, req.params.id) });
  }),
);

documentsRouter.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    const file = await getDocumentFile(req.user!.id, req.params.id);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.download(file.absPath, file.fileName);
  }),
);

documentsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteDocument(req.user!.id, req.params.id);
    res.status(204).end();
  }),
);
