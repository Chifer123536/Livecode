import { todo } from '../../../shared/kit'

// #region TSB-09 | Функция как тип параметра | ★★☆
/**
 * Применить переданную функцию к значению дважды.
 * Тип (n: number) => number описывает саму функцию: что принимает и что возвращает.
 *
 * Примеры:
 *   applyTwice(3, n => n + 1) → 5
 *   applyTwice(2, n => n * n) → 16
 */
export const applyTwice = (value: number, fn: (n: number) => number): number => todo()
// #endregion
