import { todo } from '../../../shared/kit'

// #region OBJ-17 | Query-строка в объект | ★★☆
/**
 * Повторяющийся ключ собирается в массив. Ведущий '?' допустим.
 *
 * Примеры:
 *   parseQuery('?a=1&b=x')    → { a: '1', b: 'x' }
 *   parseQuery('tag=a&tag=b') → { tag: ['a', 'b'] }
 */
export const parseQuery = (query: string): Record<string, string | string[]> => todo()
// #endregion
