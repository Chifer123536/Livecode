import { todo } from '../../../shared/kit'

// #region QZ-08 | Микрозадача внутри таймера | ★★★
/**
 *   setTimeout(() => {
 *     console.log('1')
 *     Promise.resolve().then(() => console.log('2'))
 *   }, 0)
 *   setTimeout(() => console.log('3'), 0)
 */
export const qz08 = (): string[] => todo()
// #endregion
