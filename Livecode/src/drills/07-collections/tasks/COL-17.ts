import { todo } from '../../../shared/kit'

// #region COL-17 | Свой итерируемый объект | ★★★
/**
 * Объект с методом [Symbol.iterator], который можно перебирать в for..of
 * и разворачивать спредом ПОВТОРНО — то есть каждый вызов отдаёт свежий итератор.
 *
 *   const r = makeRange(1, 4)
 *   [...r] → [1, 2, 3]
 *   [...r] → [1, 2, 3]   // второй раз тоже, это и проверяется
 */
export const makeRange = (start: number, end: number): Iterable<number> => todo()
// #endregion
