import { todo } from '../../../shared/kit'

// #region DAT-02 | Поиск по нескольким полям | ★★☆
/**
 * Подстрока без учёта регистра в любом из указанных полей.
 * Пустой запрос возвращает всё. Значения приводить к строке: поля бывают числами.
 *
 *   searchInFields(items, 'iph', ['title', 'category'])
 */
export const searchInFields = <T extends object>(items: T[], query: string, fields: Array<keyof T>): T[] =>
	todo()
// #endregion
