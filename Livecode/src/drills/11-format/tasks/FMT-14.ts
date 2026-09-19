import { todo } from '../../../shared/kit'

// #region FMT-14 | Компактное число | ★★★
/**
 * Тысячи и миллионы сокращённо, один знак после запятой, хвостовой ноль убирать.
 *
 * Примеры:
 *   formatCompact(999)      → '999'
 *   formatCompact(1200)     → '1,2 тыс.'
 *   formatCompact(1000)     → '1 тыс.'
 *   formatCompact(1500000)  → '1,5 млн'
 *   formatCompact(2e9)      → '2 млрд'
 */
export const formatCompact = (value: number): string => todo()
// #endregion
