import { todo } from '../../../shared/kit'

// #region QZ-07 | queueMicrotask и then | ★★☆
/**
 *   queueMicrotask(() => console.log('1'))
 *   Promise.resolve().then(() => console.log('2'))
 *   queueMicrotask(() => console.log('3'))
 */
export const qz07 = (): string[] => todo()
// #endregion
