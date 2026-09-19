import { todo } from '../../../shared/kit'

// #region UTL-05 | memoize | ★★☆
/**
 * Кэшировать результат по аргументам. Ключ — JSON от массива аргументов.
 * undefined как результат тоже обязан кэшироваться.
 *
 * Практика: дорогие вычисления, рекурсия с перекрывающимися подзадачами.
 */
export const memoize = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => todo()
// #endregion
