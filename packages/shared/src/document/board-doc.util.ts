import * as Y from 'yjs';

import { shapeSchema } from '../shapes/shape.schema';
import type { Shape } from '../shapes/shape.types';
import { SHAPES_MAP_KEY } from './board-doc.constants';
import type { ShapePatch, Unsubscribe } from './board-doc.types';

/**
 * A thin wrapper over a Yjs document holding the board's shapes in a top-level `Y.Map`, keyed
 * by shape id. This is the client's source of truth for shapes (Architecture §3, §4).
 *
 * Phase 1 runs this purely locally — no network provider. Because shapes are stored as whole
 * values, concurrent edits to the *same* shape converge last-writer-wins; field-level merging
 * (nested Y.Maps) is a Phase 3 refinement. Edits to *different* shapes always merge cleanly.
 */
export class BoardDoc {
  readonly doc: Y.Doc;
  private readonly shapes: Y.Map<Shape>;

  constructor(doc: Y.Doc = new Y.Doc()) {
    this.doc = doc;
    this.shapes = doc.getMap<Shape>(SHAPES_MAP_KEY);
  }

  /** Rehydrate a board from an encoded Yjs state update (e.g. a persisted snapshot). */
  static fromUpdate(update: Uint8Array): BoardDoc {
    const board = new BoardDoc();
    board.applyUpdate(update);
    return board;
  }

  /** Add or replace a shape (keyed by its id). */
  addShape(shape: Shape): void {
    this.shapes.set(shape.id, shape);
  }

  /**
   * Merge `patch` into an existing shape and store the validated result. Returns `false` if no
   * shape with `id` exists. Throws if the merged shape fails validation.
   */
  updateShape(id: string, patch: ShapePatch): boolean {
    const current = this.shapes.get(id);
    if (!current) {
      return false;
    }

    const next = shapeSchema.parse({ ...current, ...patch });
    this.shapes.set(id, next);
    return true;
  }

  /** Remove a shape by id. Returns `false` if it wasn't present. */
  removeShape(id: string): boolean {
    if (!this.shapes.has(id)) {
      return false;
    }

    this.shapes.delete(id);
    return true;
  }

  getShape(id: string): Shape | undefined {
    return this.shapes.get(id);
  }

  getShapes(): Shape[] {
    return [...this.shapes.values()];
  }

  /** Subscribe to any shape add/update/remove. Returns an unsubscribe handle. */
  observe(listener: Unsubscribe): Unsubscribe {
    const handler = (): void => listener();
    this.shapes.observe(handler);
    return () => this.shapes.unobserve(handler);
  }

  /** Encode the full document state as a Yjs update (for persistence or initial sync). */
  encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /** Apply a Yjs update from a peer or a snapshot, merging it into this document. */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update);
  }
}
