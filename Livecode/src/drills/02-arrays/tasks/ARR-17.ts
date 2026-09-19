import { todo } from '../../../shared/kit'

// #region ARR-17 | Группировка | ★★☆
/**
 * Сгруппировать элементы по вычисленному ключу.
 * Классика собеса: «сгруппируй операции по годам».
 *
 *   groupBy([{ r: 'a' }, { r: 'b' }, { r: 'a' }], x => x.r)
 *     → { a: [{ r: 'a' }, { r: 'a' }], b: [{ r: 'b' }] }
 */
export const groupBy = <T>(list: T[], keyOf: (item: T) => string): Record<string, T[]> => todo()
// #endregion
