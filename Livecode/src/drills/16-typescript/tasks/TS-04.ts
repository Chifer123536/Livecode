import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-04 | omit с точным типом | ★★☆
/**
 * Выкинуть ключи. Тип результата — Omit<T, K>.
 *
 *   omit({ a: 1, b: 'x' }, ['b']) → { a: number }
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => todo()
// #endregion
