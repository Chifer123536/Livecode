import { todo } from '../../../shared/kit'

// #region COL-11 | Уникальные по ключу | ★★☆
/**
 * Первое вхождение побеждает, порядок сохраняется. Set здесь для O(1) проверки.
 *
 * Примеры:
 *   uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], u => u.id) → [{ id: 1 }, { id: 2 }]
 */
export const uniqueBy = <T, K>(items: T[], keyFn: (item: T) => K): T[] => todo()
// #endregion
