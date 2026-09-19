import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-03 | pick с точным типом | ★★☆
/**
 * Взять подмножество ключей. Тип результата — Pick<T, K>, а не общий объект.
 *
 * Примеры:
 *   pick({ a: 1, b: 'x', c: true }, ['a', 'c']) → { a: number; c: boolean }
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => todo()
// #endregion
