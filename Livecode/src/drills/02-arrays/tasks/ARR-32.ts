import { todo } from '../../../shared/kit'

// #region ARR-32 | Схлопнуть подряд идущие дубли | ★★☆
/**
 * Убрать только ИДУЩИЕ ПОДРЯД повторы, остальные оставить.
 * Реальный кейс: лог статусов, где важны переходы, а не повторы.
 *
 * Примеры:
 *   dedupeConsecutive([1, 1, 2, 2, 1]) → [1, 2, 1]
 */
export const dedupeConsecutive = <T>(list: T[]): T[] => todo()
// #endregion
