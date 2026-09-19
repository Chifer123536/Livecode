import { todo } from '../../../shared/kit'

// #region QZ-06 | Вложенные микрозадачи | ★★★
/**
 *   Promise.resolve().then(() => {
 *     console.log('1')
 *     Promise.resolve().then(() => console.log('2'))
 *   })
 *   Promise.resolve().then(() => console.log('3'))
 */
export const qz06 = (): string[] => todo()
// #endregion
