import { todo } from '../../../shared/kit'

// #region DAT-09 | Счётчик значений | ★★☆
/**
 * Сколько товаров в каждой категории — данные для фасетного фильтра.
 *
 * Примеры:
 *   countByField(items, 'category') → { phone: 2, laptop: 1 }
 */
export const countByField = <T extends object>(items: T[], key: keyof T): Record<string, number> => todo()
// #endregion
