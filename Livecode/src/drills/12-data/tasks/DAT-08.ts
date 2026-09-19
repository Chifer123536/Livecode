import { todo } from '../../../shared/kit'

// #region DAT-08 | Агрегаты по полю | ★★☆
/**
 * Сумма, среднее, минимум, максимум за ОДИН проход. Пустой список — нули.
 *
 * Примеры:
 *   aggregate(items, 'price') → { sum: 300, avg: 100, min: 50, max: 150, count: 3 }
 */
export type Aggregate = { sum: number; avg: number; min: number; max: number; count: number }
export const aggregate = <T extends object>(items: T[], key: keyof T): Aggregate => todo()
// #endregion
