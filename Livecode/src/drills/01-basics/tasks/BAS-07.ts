// #region BAS-07 | Обратный отсчёт | ★☆☆
/**
 * Массив от n до 1.
 *
 * Примеры:
 *   countdown(3) → [3, 2, 1]
 *   countdown(0) → []
 */
export const countdown = (n: number): number[] => {
	return Array.from({ length: Math.max(0, n) }, (_, i) => n - i)
}
// #endregion
