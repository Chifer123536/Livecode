import { todo } from '../../../shared/kit'

// #region FMT-01 | Цена | ★★☆
/**
 * Разделители тысяч обычным пробелом плюс знак рубля.
 * Дробную часть отбрасывать (цены целые).
 *
 * Примеры:
 *   formatPrice(1234567) → '1 234 567 ₽'
 *   formatPrice(999)     → '999 ₽'
 *   formatPrice(0)       → '0 ₽'
 */
export const formatPrice = (value: number): string => todo()
// #endregion
