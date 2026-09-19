import { todo } from '../../../shared/kit'

// #region QZ-04 | Два таймера | ★☆☆
/**
 *   setTimeout(() => console.log('1'), 10)
 *   setTimeout(() => console.log('2'), 0)
 *   Promise.resolve().then(() => console.log('3'))
 *   console.log('4')
 */
export const qz04 = (): string[] => todo()
// #endregion
