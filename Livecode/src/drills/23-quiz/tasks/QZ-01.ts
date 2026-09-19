import { todo } from '../../../shared/kit'

// #region QZ-01 | Микрозадачи против макрозадач | ★☆☆
/**
 *   console.log('1')
 *   setTimeout(() => console.log('2'), 0)
 *   Promise.resolve().then(() => console.log('3'))
 *   console.log('4')
 */
export const qz01 = (): string[] => todo()
// #endregion
