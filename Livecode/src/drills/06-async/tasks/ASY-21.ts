import { todo } from '../../../shared/kit'

// #region ASY-21 | Асинхронный фильтр | ★★☆
/**
 * Отфильтровать массив асинхронным предикатом. Проверки идут ПАРАЛЛЕЛЬНО,
 * порядок результата — исходный.
 *
 *   filterAsync([1,2,3], async n => n % 2 === 1) → [1, 3]
 */
export const filterAsync = <T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<T[]> => todo()
// #endregion
