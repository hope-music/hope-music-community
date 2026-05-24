// Type definitions for Convex
// This file provides type definitions for Convex IDs

export type Id<T extends string> = string & { __tableName: T };
