import { todo } from '../../../shared/kit'

// #region API-15 | Ключ запроса | ★★★
/**
 * Стабильный ключ для кэша и дедупликации. Порядок полей в параметрах НЕ должен
 * менять ключ, иначе кэш промахивается на ровном месте.
 *
 *   requestKey('get', '/users', { b: 2, a: 1 }) === requestKey('GET', '/users', { a: 1, b: 2 })
 */
export const requestKey = (method: string, url: string, params?: Record<string, unknown>): string => todo()
// #endregion
