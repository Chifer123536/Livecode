import { todo } from '../../../shared/kit'

// #region ALG-09 | Позиция для вставки | ★★★
/**
 * Левая граница: индекс первого элемента >= target. Если такого нет — длина массива.
 * Это тот же бинпоиск, но без равенства — и именно он ломает людей на собесе.
 *
 * Примеры:
 *   lowerBound([1, 3, 5, 7], 4) → 2
 *   lowerBound([1, 3, 5, 7], 9) → 4
 *   lowerBound([1, 3, 3, 7], 3) → 1   // ПЕРВОЕ вхождение
 */
export const lowerBound = (sorted: number[], target: number): number => todo()
// #endregion
