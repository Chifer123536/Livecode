import { todo } from '../../../shared/kit'

// #region DAT-05 | Пагинация | ★★☆
/**
 * Страницы с единицы. Номер за пределами диапазона зажимается, а не падает.
 *
 *   paginate([1..10], 2, 3) → { items: [4, 5, 6], page: 2, pages: 4, total: 10 }
 *   paginate([], 1, 10)     → { items: [], page: 1, pages: 1, total: 0 }
 */
export type Page<T> = { items: T[]; page: number; pages: number; total: number }
export const paginate = <T>(items: T[], page: number, perPage: number): Page<T> => todo()
// #endregion
