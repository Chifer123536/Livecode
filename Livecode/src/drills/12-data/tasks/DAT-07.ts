import { todo } from '../../../shared/kit'

// #region DAT-07 | Группировка в объект | ★☆☆
/**
 *   groupByField(items, 'category') → { phone: [...], laptop: [...] }
 */
export const groupByField = <T extends object>(items: T[], key: keyof T): Record<string, T[]> => todo()
// #endregion
