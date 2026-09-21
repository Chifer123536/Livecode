// #region BAS-04 | Модуль числа | ★☆☆
/**
 * Модуль числа. Без Math.abs — нужен явный if или тернарник.
 *
 * Примеры:
 *   abs(-7) → 7
 *   abs(7)  → 7
 */
export const abs = (n: number): number => {
	return n < 0 ? -n : n
}
// #endregion
