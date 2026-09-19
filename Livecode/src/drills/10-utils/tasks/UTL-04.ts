import { todo } from '../../../shared/kit'

// #region UTL-04 | once | ★☆☆
/**
 * Выполнить функцию ровно один раз, дальше возвращать первый результат.
 *
 * Практика: инициализация соединения, однократная подписка.
 */
export const once = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => todo()
// #endregion
