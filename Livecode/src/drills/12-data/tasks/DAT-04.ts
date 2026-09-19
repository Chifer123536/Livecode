import { todo } from '../../../shared/kit'
import type { SortDirection } from './_pack'

// #region DAT-04 | Сортировка по нескольким полям | ★★★
/**
 * Список правил по приоритету: равны по первому — сравниваем по второму, и так далее.
 *
 *   multiSort(items, [{ key: 'category', direction: 'asc' }, { key: 'price', direction: 'desc' }])
 */
export type SortRule<T> = { key: keyof T; direction: SortDirection }
export const multiSort = <T extends object>(items: T[], rules: Array<SortRule<T>>): T[] => todo()
// #endregion
