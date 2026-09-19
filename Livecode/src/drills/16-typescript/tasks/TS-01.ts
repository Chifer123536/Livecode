import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-01 | Дженерик-функция | ★☆☆
/**
 * Вернуть первый элемент массива или undefined для пустого.
 * Типизировать так, чтобы first([1,2]) имел тип number | undefined,
 * а first(['a']) — string | undefined. Без any и без перегрузок.
 */
export const first = <T>(list: T[]): T | undefined => todo()
// #endregion
