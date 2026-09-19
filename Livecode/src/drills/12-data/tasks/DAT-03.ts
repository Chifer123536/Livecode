import { todo } from '../../../shared/kit'
import type { SortDirection } from './_pack'

// #region DAT-03 | Сортировка по полю | ★★☆
/**
 * Числа сравнивать вычитанием, строки — localeCompare (иначе 'Ёлка' уедет в конец).
 * Возвращает НОВЫЙ массив.
 */
export const sortByField = <T extends object>(items: T[], key: keyof T, direction?: SortDirection): T[] =>
	todo()
// #endregion
