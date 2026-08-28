import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../lib/asyncHandler';
import {
  createProperty,
  createPropertySchema,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
  updatePropertySchema,
} from './properties.service';

export const propertiesRouter = Router();

propertiesRouter.use(requireAuth);

propertiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ properties: await listProperties(req.user!.id) });
  }),
);

propertiesRouter.post(
  '/',
  validate(createPropertySchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ property: await createProperty(req.user!.id, req.body) });
  }),
);

propertiesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ property: await getProperty(req.user!.id, req.params.id) });
  }),
);

propertiesRouter.patch(
  '/:id',
  validate(updatePropertySchema),
  asyncHandler(async (req, res) => {
    res.json({ property: await updateProperty(req.user!.id, req.params.id, req.body) });
  }),
);

propertiesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteProperty(req.user!.id, req.params.id);
    res.status(204).end();
  }),
);
