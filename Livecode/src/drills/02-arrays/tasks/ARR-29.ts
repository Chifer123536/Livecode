import { todo } from '../../../shared/kit'

// #region ARR-29 | Скользящее окно | ★★★
/**
 * Все подряд идущие окна длины size.
 * Реальный кейс: сгладить график, посчитать среднее за 7 дней.
 *
 * Примеры:
 *   windowed([1, 2, 3, 4], 2) → [[1, 2], [2, 3], [3, 4]]
 *   windowed([1, 2], 5)       → []
 */
export const windowed = <T>(list: T[], size: number): T[][] => todo()
// #endregion
