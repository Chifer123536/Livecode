import { todo } from '../../../shared/kit'

// #region STR-24 | Подсветить совпадение | ★★☆
/**
 * Обернуть все вхождения подстроки в <mark>, сохранив исходный регистр текста.
 * Поиск без учёта регистра. Пустой запрос — вернуть текст как есть.
 *
 *   highlight('Привет мир', 'мир') → 'Привет <mark>мир</mark>'
 *   highlight('Мир и МИР', 'мир')  → '<mark>Мир</mark> и <mark>МИР</mark>'
 */
export const highlight = (text: string, query: string): string => todo()
// #endregion
