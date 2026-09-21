import { todo } from '../../../shared/kit'

// #region TSB-12 | Дискриминированное объединение | ★★☆
/**
 * Посчитать площадь фигуры.
 * Поле kind — дискриминатор: по его значению компилятор понимает, какие поля доступны.
 *
 * Примеры:
 *   area({ kind: 'square', side: 3 }) → 9
 *   area({ kind: 'circle', r: 1 })    → 3.14159...
 */
export type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number }

export const area = (shape: Shape): number => todo()
// #endregion
