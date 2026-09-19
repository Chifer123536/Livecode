import { todo } from '../../../shared/kit'

// #region API-02 | Разбор query-строки | ★★☆
/**
 * Обратная операция. Ведущий '?' допустим. Повторяющийся ключ становится массивом.
 *
 * Примеры:
 *   parseQuery('?page=2&tag=a&tag=b') → { page: '2', tag: ['a', 'b'] }
 *   parseQuery('') → {}
 */
export const parseQuery = (query: string): Record<string, string | string[]> => todo()
// #endregion
