import { todo } from '../../../shared/kit'

// #region COL-12 | Кэш по объекту в WeakMap | ★★★
/**
 * Мемоизация функции одного объектного аргумента. Ключ — сам объект.
 * Именно WeakMap, а не Map: иначе кэш держит объект живым и это утечка.
 * Объяснить разницу вслух — половина задачи.
 */
export const memoizeByObject = <A extends object, R>(fn: (arg: A) => R): ((arg: A) => R) => todo()
// #endregion
