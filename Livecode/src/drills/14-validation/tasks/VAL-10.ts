import { todo } from '../../../shared/kit'

// #region VAL-10 | Номер карты | ★★★
/**
 * Алгоритм Луна: справа налево удваиваем каждую вторую цифру, из результата больше 9
 * вычитаем 9, сумма должна делиться на 10. Пробелы и дефисы допустимы.
 *
 *   luhnCheck('4561 2612 1234 5467') → true
 *   luhnCheck('1234 5678 1234 5678') → false
 */
export const luhnCheck = (value: string): boolean => todo()
// #endregion
