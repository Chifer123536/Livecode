import { todo } from '../../../shared/kit'

// #region VAL-07 | Дата ДД.ММ.ГГГГ | ★★★
/**
 * Проверять не только формат, но и существование даты: 31.02.2026 не существует,
 * хотя формат верный. Приём: собрать Date и сверить, что части не «переехали».
 *
 *   isValidDateRu('29.02.2024') → true    // високосный
 *   isValidDateRu('29.02.2026') → false
 *   isValidDateRu('1.1.2026')   → false   // нужны две цифры
 */
export const isValidDateRu = (value: string): boolean => todo()
// #endregion
