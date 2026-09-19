import { todo } from '../../../shared/kit'

// #region FMT-08 | Дата словами | ★★☆
/**
 * Родительный падеж месяца, без года если год совпадает с текущим.
 *
 * Примеры:
 *   formatDateLong(new Date(2026, 2, 5), 2026) → '5 марта'
 *   formatDateLong(new Date(2025, 11, 31), 2026) → '31 декабря 2025'
 */
export const formatDateLong = (date: Date, currentYear: number): string => todo()
// #endregion
