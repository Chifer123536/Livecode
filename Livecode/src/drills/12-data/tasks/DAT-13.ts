import { todo } from '../../../shared/kit'
import type { Normalized } from './DAT-12'

// #region DAT-13 | Денормализация | ★★☆
/**
 * Обратно в массив, порядок берётся из allIds. Пропавшие id молча пропускаются.
 */
export const denormalize = <T extends { id: number }>(source: Normalized<T>): T[] => todo()
// #endregion
