import { todo } from '../../../shared/kit'

// #region FMT-20 | Маска телефона при вводе | ★★★
/**
 * Форматировать НЕПОЛНЫЙ ввод, чтобы маска росла вместе с набором.
 * Всё, кроме цифр, выбрасывается, лишние цифры отсекаются.
 *
 * Примеры:
 *   formatPhoneInput('')            → ''
 *   formatPhoneInput('7')           → '+7'
 *   formatPhoneInput('7999')        → '+7 (999'
 *   formatPhoneInput('79991')       → '+7 (999) 1'
 *   formatPhoneInput('79991234567') → '+7 (999) 123-45-67'
 */
export const formatPhoneInput = (raw: string): string => todo()
// #endregion
