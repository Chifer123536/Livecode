import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-05 | Пользовательский type guard | ★★☆
/**
 * isString — предикат типа: сигнатура `value is string`.
 * onlyStrings использует его так, чтобы результат имел тип string[] БЕЗ приведения.
 *
 * Примеры:
 *   onlyStrings([1, 'a', null, 'b']) → ['a', 'b'] типа string[]
 */
export const isString = (value: unknown): value is string => todo()
export const onlyStrings = (list: unknown[]): string[] => todo()
// #endregion
