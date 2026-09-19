import { todo } from '../../../shared/kit'

// #region ARR-20 | Сортировка по нескольким полям | ★★★
/**
 * Сортировка таблицы по списку правил: сначала по первому, при равенстве — по второму.
 * Реальный кейс: таблица заказов «сначала по статусу, потом по дате убыв.».
 *
 *   sortByMany(rows, [{ key: 'role', dir: 'asc' }, { key: 'age', dir: 'desc' }])
 */
export type SortRule<T> = { key: keyof T; dir: 'asc' | 'desc' }
export const sortByMany = <T extends Record<string, string | number>>(list: T[], rules: Array<SortRule<T>>): T[] =>
	todo()
// #endregion
