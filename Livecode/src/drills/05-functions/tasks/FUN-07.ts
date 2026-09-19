import { todo } from '../../../shared/kit'

// #region FUN-07 | Циклический переключатель | ★★☆
/**
 * Каждый вызов возвращает следующее значение из списка, после последнего — снова первое.
 *
 *   const next = createCycle(['a', 'b'])
 *
 * Примеры:
 *   next() → 'a', next() → 'b', next() → 'a'
 */
export const createCycle = <T>(values: T[]): (() => T) => todo()
// #endregion
