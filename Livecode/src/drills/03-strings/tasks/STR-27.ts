import { todo } from '../../../shared/kit'

// #region STR-27 | Разобрать ФИО | ★★☆
/**
 * Разложить строку на фамилию, имя и отчество. Отсутствующие части — пустые строки.
 * Лишние пробелы не должны мешать.
 *
 * Примеры:
 *   splitName('Иванов Иван Иванович') → { last: 'Иванов', first: 'Иван', middle: 'Иванович' }
 *   splitName('Иванов Иван')          → { last: 'Иванов', first: 'Иван', middle: '' }
 */
export type FullName = { last: string; first: string; middle: string }
export const splitName = (fullName: string): FullName => todo()
// #endregion
