import { todo } from '../../../shared/kit'

// #region VAL-15 | Очистка ввода | ★★☆
/**
 * Обрезать края, схлопнуть внутренние пробелы, вырезать html-теги.
 * Это не защита от XSS (она на выводе), а нормализация перед сравнением и отправкой.
 *
 * Примеры:
 *   sanitizeInput('  Ян   <b>Ян</b> ') → 'Ян Ян'
 */
export const sanitizeInput = (value: string): string => todo()
// #endregion
