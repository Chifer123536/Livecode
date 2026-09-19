import { todo } from '../../../shared/kit'

// #region QZ-05 | async/await | ★★★
/**
 *   async function run() {
 *     console.log('1')
 *     await null
 *     console.log('2')
 *   }
 *   console.log('0')
 *   run()
 *   console.log('3')
 *   Promise.resolve().then(() => console.log('4'))
 */
export const qz05 = (): string[] => todo()
// #endregion
