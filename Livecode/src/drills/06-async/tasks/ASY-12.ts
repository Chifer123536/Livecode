import { todo } from '../../../shared/kit'

// #region ASY-12 | Таймаут | ★★☆
/**
 * Отклонить с Error('timeout'), если промис не успел за ms.
 * Успел — вернуть его значение. Таймер обязательно снять, чтобы не держать процесс.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => todo()
// #endregion
