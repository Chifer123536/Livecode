import { todo } from '../../../shared/kit'

// #region ARR-31 | Разложить по колонкам | ★★★
/**
 * Разложить список по columns колонкам СВЕРХУ ВНИЗ (как CSS columns), а не по строкам.
 * Лишние элементы уходят в первые колонки.
 *
 *   toColumns([1, 2, 3, 4, 5], 2) → [[1, 2, 3], [4, 5]]
 *   toColumns([1, 2, 3], 3)       → [[1], [2], [3]]
 */
export const toColumns = <T>(list: T[], columns: number): T[][] => todo()
// #endregion
