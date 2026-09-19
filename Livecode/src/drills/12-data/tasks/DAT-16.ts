import { todo } from '../../../shared/kit'

// #region DAT-16 | Оставить только нужные поля | ★★☆
/**
 * Урезать объекты списка до набора полей — то, что уходит в таблицу или в CSV.
 *
 *   selectFields(items, ['id', 'title']) → [{ id: 1, title: '...' }]
 */
export const selectFields = <T extends object, K extends keyof T>(items: T[], keys: K[]): Array<Pick<T, K>> =>
	todo()
// #endregion
