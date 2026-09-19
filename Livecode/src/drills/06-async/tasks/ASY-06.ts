import { todo } from '../../../shared/kit'

// #region ASY-06 | Свой Promise.allSettled | ★★★
/**
 * Никогда не отклоняется. Для каждого промиса возвращает объект статуса.
 *
 *   [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: Error }]
 */
export type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }
export const myAllSettled = <T>(promises: Array<Promise<T>>): Promise<Array<Settled<T>>> => todo()
// #endregion
