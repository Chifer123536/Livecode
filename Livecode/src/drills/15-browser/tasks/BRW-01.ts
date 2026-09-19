import { todo } from '../../../shared/kit'

// #region BRW-01 | Параметры адреса | ★★☆
/**
 * Все query-параметры адреса в объект. Повторяющийся ключ — массив.
 *
 *   getQueryParams('https://a.ru/x?page=2&tag=a&tag=b') → { page: '2', tag: ['a', 'b'] }
 */
export const getQueryParams = (url: string): Record<string, string | string[]> => todo()
// #endregion
