import { todo } from '../../../shared/kit'

// #region TSB-20 | null против undefined | ★★☆
/**
 * Вернуть первое чётное число массива. Если такого нет — вернуть null, а не undefined.
 * Тип возврата number | null заставляет вызывающий код обработать отсутствие.
 *
 * Примеры:
 *   firstEven([1, 3, 4]) → 4
 *   firstEven([1, 3])    → null
 */
export const firstEven = (list: number[]): number | null => todo()
// #endregion
