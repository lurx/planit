import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';

import { createLine, createRect } from '../../shapes/shape.factory';
import { BoardDoc } from '../board-doc.util';

function rect(id: string, x = 0, y = 0) {
  return createRect({ id, x, y, width: 50, height: 50 });
}

describe('BoardDoc CRUD', () => {
  it('adds a shape and reads it back', () => {
    const board = new BoardDoc();
    const shape = rect('r1');

    board.addShape(shape);

    expect(board.getShape('r1')).toEqual(shape);
    expect(board.getShapes()).toEqual([shape]);
  });

  it('replaces a shape when adding with an existing id', () => {
    const board = new BoardDoc();
    board.addShape(rect('r1', 0, 0));
    board.addShape(rect('r1', 100, 100));

    expect(board.getShapes()).toHaveLength(1);
    expect(board.getShape('r1')).toMatchObject({ x: 100 });
  });

  it('updates an existing shape and strips foreign-variant keys', () => {
    const board = new BoardDoc();
    board.addShape(rect('r1'));

    const updated = board.updateShape('r1', { x: 25, text: 'hi', x1: 999 });

    expect(updated).toBe(true);
    const shape = board.getShape('r1');
    expect(shape).toMatchObject({ type: 'rect', x: 25, text: 'hi' });
    expect(shape).not.toHaveProperty('x1');
  });

  it('returns false when updating a missing shape', () => {
    const board = new BoardDoc();

    expect(board.updateShape('nope', { x: 1 })).toBe(false);
  });

  it('throws when an update would make the shape invalid', () => {
    const board = new BoardDoc();
    board.addShape(rect('r1'));

    expect(() => board.updateShape('r1', { width: -5 })).toThrow();
  });

  it('removes a shape and reports whether it existed', () => {
    const board = new BoardDoc();
    board.addShape(rect('r1'));

    expect(board.removeShape('r1')).toBe(true);
    expect(board.removeShape('r1')).toBe(false);
    expect(board.getShapes()).toEqual([]);
  });
});

describe('BoardDoc.observe', () => {
  it('fires the listener on changes and stops after unsubscribe', () => {
    const board = new BoardDoc();
    const listener = vi.fn();

    const unsubscribe = board.observe(listener);
    board.addShape(rect('r1'));
    board.updateShape('r1', { x: 10 });
    board.removeShape('r1');

    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    board.addShape(rect('r2'));

    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe('BoardDoc serialization', () => {
  it('round-trips shapes through an encoded state update', () => {
    const source = new BoardDoc();
    source.addShape(rect('r1', 10, 20));
    source.addShape(createLine({ id: 'l1', x1: 0, y1: 0, x2: 5, y2: 5 }));

    const restored = BoardDoc.fromUpdate(source.encodeState());

    expect(restored.getShapes()).toEqual(source.getShapes());
  });
});

describe('BoardDoc concurrent merge (Phase 3 sanity)', () => {
  it('merges edits to different shapes from two peers', () => {
    const peerA = new BoardDoc();
    const peerB = new BoardDoc();
    peerA.addShape(rect('a', 0, 0));
    peerB.addShape(rect('b', 100, 100));

    // Exchange updates both ways.
    peerB.applyUpdate(peerA.encodeState());
    peerA.applyUpdate(peerB.encodeState());

    const idsA = peerA
      .getShapes()
      .map((shape) => shape.id)
      .sort();
    const idsB = peerB
      .getShapes()
      .map((shape) => shape.id)
      .sort();
    expect(idsA).toEqual(['a', 'b']);
    expect(idsB).toEqual(['a', 'b']);
  });

  it('converges to a single value when both peers edit the same shape', () => {
    const peerA = new BoardDoc();
    const peerB = new BoardDoc();
    // Seed both with the same shape from a shared origin.
    const seed = new BoardDoc();
    seed.addShape(rect('shared'));
    const seedUpdate = seed.encodeState();
    peerA.applyUpdate(seedUpdate);
    peerB.applyUpdate(seedUpdate);

    peerA.updateShape('shared', { x: 10 });
    peerB.updateShape('shared', { x: 20 });

    // Use Yjs state vectors so each peer only applies the other's missing changes.
    const updateForB = Y.encodeStateAsUpdate(peerA.doc, Y.encodeStateVector(peerB.doc));
    const updateForA = Y.encodeStateAsUpdate(peerB.doc, Y.encodeStateVector(peerA.doc));
    peerB.applyUpdate(updateForB);
    peerA.applyUpdate(updateForA);

    expect(peerA.getShape('shared')).toEqual(peerB.getShape('shared'));
  });
});
