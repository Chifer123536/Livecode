import { todo } from '../../../shared/kit'

// #region QZ-03 | Цепочка then | ★★☆
/**
 *   Promise.resolve().then(() => console.log('1')).then(() => console.log('2'))
 *   Promise.resolve().then(() => console.log('3')).then(() => console.log('4'))
 */
export const qz03 = (): string[] => todo()
// #endregion
