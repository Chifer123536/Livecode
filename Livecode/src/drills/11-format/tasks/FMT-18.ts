import { todo } from '../../../shared/kit'

// #region FMT-18 | Диапазон цен | ★★☆
/**
 * Любая граница может отсутствовать.
 *
 *   formatRange(100, 500)  → 'от 100 до 500 ₽'
 *   formatRange(100, null) → 'от 100 ₽'
 *   formatRange(null, 500) → 'до 500 ₽'
 *   formatRange(null, null) → ''
 *   formatRange(100, 100)  → '100 ₽'
 */
export const formatRange = (from: number | null, to: number | null): string => todo()
// #endregion
