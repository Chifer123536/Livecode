import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-07 | Тип из массива через as const | ★★☆
/**
 * ROLES объявлен как константа. Объяви тип Role так, чтобы он был
 * 'admin' | 'editor' | 'viewer', а не string.
 * isRole — предикат, проверяющий принадлежность строки к ROLES.
 */
export const ROLES = ['admin', 'editor', 'viewer'] as const
export type Role = string // ← замени на правильный тип
export const isRole = (value: string): value is Role => todo()

type _TS07 = Expect<Equal<Role, 'admin' | 'editor' | 'viewer'>>
// #endregion
