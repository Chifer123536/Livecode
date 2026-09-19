import { todo } from '../../../shared/kit'

// #region FUN-05 | Ловушка цикла | ★★☆
/**
 * Вернуть массив из n функций, где i-я функция возвращает своё i.
 *
 *   const fns = makeIndexFunctions(3)
 *   fns[0]() → 0, fns[2]() → 2
 *
 * Это тот самый пример «три раза 3», на котором проверяют понимание var и let.
 * Напиши рабочую версию, а потом ОБЪЯСНИ ВСЛУХ, почему с var она бы сломалась.
 */
export const makeIndexFunctions = (n: number): Array<() => number> => todo()
// #endregion
