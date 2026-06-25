import { z } from 'zod';

/**
 * Zod schemas are the single source of truth for the shape domain. The TypeScript types in
 * `shape.types.ts` are derived from these via `z.infer`, so the wire format and the compile
 * -time types can never drift — the keystone principle for `apps/web` and `apps/ws`.
 *
 * All geometry is in **world space** (the infinite canvas plane), never screen space.
 */

const baseShapeSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
});

/** Axis-aligned box shapes share an `{ x, y, width, height }` top-left + size geometry. */
const boxGeometrySchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
});

/** Two-point shapes share a `{ x1, y1, x2, y2 }` start/end geometry. */
const segmentGeometrySchema = z.object({
  x1: z.number().finite(),
  y1: z.number().finite(),
  x2: z.number().finite(),
  y2: z.number().finite(),
});

export const rectShapeSchema = baseShapeSchema
  .extend(boxGeometrySchema.shape)
  .extend({ type: z.literal('rect') });

export const ellipseShapeSchema = baseShapeSchema
  .extend(boxGeometrySchema.shape)
  .extend({ type: z.literal('ellipse') });

export const lineShapeSchema = baseShapeSchema
  .extend(segmentGeometrySchema.shape)
  .extend({ type: z.literal('line') });

export const arrowShapeSchema = baseShapeSchema
  .extend(segmentGeometrySchema.shape)
  .extend({ type: z.literal('arrow') });

export const shapeSchema = z.discriminatedUnion('type', [
  rectShapeSchema,
  ellipseShapeSchema,
  lineShapeSchema,
  arrowShapeSchema,
]);
