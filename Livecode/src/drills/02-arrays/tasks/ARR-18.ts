import { todo } from '../../../shared/kit'

// #region ARR-18 | Подсчёт по ключу | ★★☆
/**
 * Сколько элементов в каждой группе.
 *
 *   countBy(['a', 'b', 'a'], x => x) → { a: 2, b: 1 }
 */
export const countBy = <T>(list: T[], keyOf: (item: T) => string): Record<string, number> => todo()
// #endregion
