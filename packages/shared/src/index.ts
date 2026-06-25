/**
 * @planit/shared — the keystone package.
 *
 * Domain types, the CRDT document schema, validation, and the wire protocol live here so
 * that `apps/web` and (later) `apps/ws` import byte-identical definitions.
 */

export * from './camera';
export * from './document';
export * from './geometry';
export * from './shapes';
export * from './spatial';
