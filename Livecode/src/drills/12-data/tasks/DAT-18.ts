import { todo } from '../../../shared/kit'

// #region DAT-18 | Лучший в каждой группе | ★★★
/**
 * По одному элементу на группу — с максимальным значением поля.
 * При равенстве побеждает первый встреченный.
 *
 * Примеры:
 *   topByGroup(items, 'category', 'rating') → [{ лучший телефон }, { лучший ноутбук }]
 */
export const topByGroup = <T extends object>(items: T[], groupKey: keyof T, valueKey: keyof T): T[] => todo()
// #endregion
