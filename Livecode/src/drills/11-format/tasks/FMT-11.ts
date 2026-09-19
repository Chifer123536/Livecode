import { todo } from '../../../shared/kit'

// #region FMT-11 | Длительность | ★★★
/**
 * Секунды в человеческий вид, максимум ДВЕ единицы, нулевые пропускать.
 *
 * Примеры:
 *   formatDuration(30)   → '30 с'
 *   formatDuration(65)   → '1 мин 5 с'
 *   formatDuration(3600) → '1 ч'
 *   formatDuration(3905) → '1 ч 5 мин'
 *   formatDuration(0)    → '0 с'
 */
export const formatDuration = (totalSeconds: number): string => todo()
// #endregion
