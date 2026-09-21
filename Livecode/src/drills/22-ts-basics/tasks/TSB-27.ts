import type { Equal, Expect } from '../../../shared/types'

// #region TSB-27 | Parameters | ★★☆
/**
 * Достать тип первого аргумента функции send.
 */
declare function send(to: string, retries: number): void

export type SendTo = typeof send

type _TSB27 = Expect<Equal<SendTo, string>>
// #endregion
