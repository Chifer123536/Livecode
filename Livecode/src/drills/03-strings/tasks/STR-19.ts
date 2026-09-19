import { todo } from '../../../shared/kit'

// #region STR-19 | Шаблон | ★★☆
/**
 * Подставить значения вместо {{ключ}}. Пробелы внутри скобок допустимы.
 * Отсутствующий ключ заменяется пустой строкой.
 *
 *   template('Привет, {{ name }}!', { name: 'Аня' }) → 'Привет, Аня!'
 */
export const template = (text: string, values: Record<string, string | number>): string => todo()
// #endregion
