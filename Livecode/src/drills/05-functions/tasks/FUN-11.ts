import { todo } from '../../../shared/kit'

// #region FUN-11 | Подглядеть значение | ★☆☆
/**
 * Выполнить побочное действие и вернуть значение без изменений.
 * Нужен, чтобы вставить лог в середину цепочки, ничего не сломав.
 *
 *   [1, 2].map(n => tap(n, console.log))
 */
export const tap = <T>(value: T, fn: (value: T) => void): T => todo()
// #endregion
