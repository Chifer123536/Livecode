import { todo } from '../../../shared/kit'

// #region FUN-01 | Счётчик с приватным состоянием | ★☆☆
/**
 * Вернуть объект { inc, dec, value }. Переменная-счётчик недоступна снаружи.
 * Два вызова createCounter дают НЕЗАВИСИМЫЕ счётчики — это ключевая проверка.
 *
 * Примеры:
 *   const c = createCounter(5); c.inc(); c.value() → 6
 */
export type Counter = { inc: () => void; dec: () => void; value: () => number }
export const createCounter = (initial?: number): Counter => todo()
// #endregion
