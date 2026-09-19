import { todo } from '../../../shared/kit'

// #region ASY-04 | Параллельный запуск | ★☆☆
/**
 * Запустить все задачи сразу, дождаться всех. Порядок результатов — исходный.
 * Одна упала — падает всё (как Promise.all).
 */
export const parallel = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> => todo()
// #endregion
