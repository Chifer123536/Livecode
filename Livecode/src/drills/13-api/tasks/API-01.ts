import { todo } from '../../../shared/kit'

// #region API-01 | Сборка query-строки | ★★☆
/**
 * Объект в query. undefined и null выбрасываются (иначе в URL уедет 'undefined'),
 * массив повторяет ключ, значения кодируются.
 *
 *   buildQuery({ q: 'ноут бук', page: 2, tag: ['a', 'b'], empty: null })
 *     → 'q=%D0%BD%D0%BE%D1%83%D1%82%20%D0%B1%D1%83%D0%BA&page=2&tag=a&tag=b'
 *   buildQuery({}) → ''
 */
export const buildQuery = (params: Record<string, unknown>): string => todo()
// #endregion
