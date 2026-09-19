import { todo } from '../../../shared/kit'

// #region ARR-19 | Сортировка по ключу | ★★☆
/**
 * Отсортировать по вычисленному ключу. Числа — по величине, строки — localeCompare.
 * ВХОДНОЙ МАССИВ НЕ МУТИРОВАТЬ.
 *
 *   sortBy([{ n: 10 }, { n: 9 }], x => x.n) → [{ n: 9 }, { n: 10 }]
 */
export const sortBy = <T>(list: T[], keyOf: (item: T) => number | string): T[] => todo()
// #endregion
