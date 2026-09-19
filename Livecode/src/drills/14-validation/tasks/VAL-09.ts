import { todo } from '../../../shared/kit'

// #region VAL-09 | Ссылка | ★★☆
/**
 * Только http и https. Разбор делать конструктором URL, а не регуляркой.
 *
 * Примеры:
 *   isValidUrl('https://a.ru/x?y=1') → true
 *   isValidUrl('javascript:alert(1)') → false
 */
export const isValidUrl = (value: string): boolean => todo()
// #endregion
