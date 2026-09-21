import { todo } from '../../../shared/kit'

// #region TSB-15 | Union вместо enum | ★☆☆
/**
 * Статус считается завершённым, если это 'done' или 'error'.
 *
 * Примеры:
 *   isFinished('done')    → true
 *   isFinished('loading') → false
 */
export type Status = 'idle' | 'loading' | 'done' | 'error'

export const isFinished = (status: Status): boolean => todo()
// #endregion
