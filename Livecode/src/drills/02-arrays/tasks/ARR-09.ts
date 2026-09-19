import { todo } from '../../../shared/kit'

// #region ARR-09 | Уникальные по ключу | ★★☆
/**
 * Убрать повторы по вычисленному ключу. Побеждает ПЕРВЫЙ встреченный.
 * Реальный кейс: пришли дубли из двух источников, оставляем по id.
 *
 * Примеры:
 *   uniqueBy([{ id: 1, v: 'a' }, { id: 1, v: 'b' }], x => x.id) → [{ id: 1, v: 'a' }]
 */
export const uniqueBy = <T>(list: T[], keyOf: (item: T) => unknown): T[] => todo()
// #endregion
