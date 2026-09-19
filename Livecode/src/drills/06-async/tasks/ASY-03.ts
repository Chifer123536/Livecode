import { todo } from '../../../shared/kit'

// #region ASY-03 | Последовательный запуск | ★★☆
/**
 * Выполнить задачи ПО ОЧЕРЕДИ и вернуть массив результатов в том же порядке.
 * Следующая не стартует, пока не закончилась предыдущая.
 *
 *   sequential([() => f1(), () => f2()]) → [r1, r2]
 */
export const sequential = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> => todo()
// #endregion
