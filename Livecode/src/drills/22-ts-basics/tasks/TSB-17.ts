import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TSB-17 | Первый дженерик | ★★☆
/**
 * Вернуть последний элемент массива или undefined для пустого.
 * Тип должен сохраняться: last([1,2]) это number | undefined, last(['a']) это string | undefined.
 * Без any.
 *
 * Примеры:
 *   last([1, 2]) → 2
 *   last([])     → undefined
 */
export const last = <T>(list: T[]): T | undefined => todo()

type _TSB17 = Expect<Equal<ReturnType<typeof last<number>>, number | undefined>>
// #endregion
