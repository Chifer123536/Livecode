import { todo } from '../../../shared/kit'

// #region COL-13 | Генератор диапазона | ★★☆
/**
 * Ленивый аналог Array.from({ length }). Конец не включается, шаг может быть отрицательным.
 *
 * Примеры:
 *   [...range(0, 5)]      → [0, 1, 2, 3, 4]
 *   [...range(5, 0, -2)]  → [5, 3, 1]
 */
export function* range(start: number, end: number, step = 1): Generator<number> {
	todo()
}
// #endregion
