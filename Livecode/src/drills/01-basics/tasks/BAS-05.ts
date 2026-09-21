// #region BAS-05 | Зажать в диапазон | ★☆☆
/**
 * Вернуть n, но не выходящее за [min, max].
 * Реальный кейс: ограничить громкость, страницу пагинации, позицию слайдера.
 *
 * Примеры:
 *   clamp(15, 0, 10) → 10
 *   clamp(-3, 0, 10) → 0
 *   clamp(5, 0, 10)  → 5
 */
export const clamp = (n: number, min: number, max: number): number => {
	return Math.min(Math.max(n, min), max)
}
// #endregion
