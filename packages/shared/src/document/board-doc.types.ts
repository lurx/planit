/**
 * A partial update to a shape's mutable fields. Keys that don't belong to the target shape's
 * variant are stripped on apply (the schema validates the merged result), so callers can pass
 * any geometry/text subset without corrupting the stored shape.
 */
export type ShapePatch = Partial<{
  x: number;
  y: number;
  width: number;
  height: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
}>;

/** Unsubscribe handle returned by {@link BoardDoc.observe}. */
export type Unsubscribe = () => void;
