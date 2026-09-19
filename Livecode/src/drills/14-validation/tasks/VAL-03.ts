import { todo } from '../../../shared/kit'

// #region VAL-03 | Телефон | ★★☆
/**
 * Нормализовать к виду +7XXXXXXXXXX: выкинуть всё, кроме цифр, ведущую 8 заменить на 7.
 * Неподходящее — null.
 *
 *   normalizePhone('8 (999) 123-45-67') → '+79991234567'
 *   normalizePhone('+7 999 123 45 67')  → '+79991234567'
 *   normalizePhone('12345')             → null
 */
export const normalizePhone = (value: string): string | null => todo()
// #endregion
