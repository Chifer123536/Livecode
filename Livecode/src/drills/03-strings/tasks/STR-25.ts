import { todo } from '../../../shared/kit'

// #region STR-25 | Размер файла | ★★★
/**
 * Байты в человеческий вид. Единицы: Б, КБ, МБ, ГБ. Делитель 1024.
 * Округлять до двух знаков, лишние нули убирать.
 *
 * Примеры:
 *   formatBytes(0)       → '0 Б'
 *   formatBytes(1024)    → '1 КБ'
 *   formatBytes(1536)    → '1.5 КБ'
 *   formatBytes(1234567) → '1.18 МБ'
 */
export const formatBytes = (bytes: number): string => todo()
// #endregion
