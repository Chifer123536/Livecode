import { todo } from '../../../shared/kit'

// #region TSB-05 | Литеральные типы | ★☆☆
/**
 * Сдвинуть позицию на шаг в заданную сторону.
 * Direction — не string, а ровно два допустимых значения. Опечатка 'Up' не скомпилируется.
 *
 * Примеры:
 *   move(5, 'up')   → 6
 *   move(5, 'down') → 4
 */
export type Direction = 'up' | 'down'

export const move = (position: number, direction: Direction): number => todo()
// #endregion
