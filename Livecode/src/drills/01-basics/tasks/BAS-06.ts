// #region BAS-06 | Среднее арифметическое | ★☆☆
/**
 * Примеры:
 * Среднее по массиву. Пустой массив → 0 (а не NaN).
 *
 *   average([1, 2, 3, 4]) → 2.5
 *   average([])           → 0
 */
export const average = (nums: number[]): number => {
	return nums.length === 0 ? 0 : nums.reduce((acc, val) => acc + val, 0) / nums.length
}
// #endregion
