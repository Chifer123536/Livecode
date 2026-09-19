import { todo } from '../../../shared/kit'

// #region BAS-17 | Округление до N знаков | ★★☆
/**
 * Округлить до digits знаков после запятой способом «умножить → Math.round → разделить».
 * Половина уходит в сторону плюс бесконечности: -2.5 → -2.
 *
 *   roundTo(3.14159, 2) → 3.14
 *   roundTo(-2.5, 0)    → -2
 *   roundTo(10, 2)      → 10
 *   roundTo(1.005, 2)   → 1      // не 1.01 — см. разбор, это IEEE-754, а не баг
 */
export const roundTo = (n: number, digits: number): number => todo()
// #endregion
