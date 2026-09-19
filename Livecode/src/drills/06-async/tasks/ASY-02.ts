import { todo } from '../../../shared/kit'

// #region ASY-02 | Значение через задержку | ★☆☆
/**
 * Резолвится значением через ms миллисекунд.
 *
 *   await delayValue('ок', 50) → 'ок'
 */
export const delayValue = <T>(value: T, ms: number): Promise<T> => todo()
// #endregion
