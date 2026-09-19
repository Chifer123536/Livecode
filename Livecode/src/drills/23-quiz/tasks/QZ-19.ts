import { todo } from '../../../shared/kit'

// #region QZ-19 | Порядок в классе | ★★☆
/**
 *   class A { constructor() { console.log('A') } }
 *   class B extends A { constructor() { console.log('до super'); super(); console.log('после super') } }
 *   new B()
 */
export const qz19 = (): string[] => todo()
// #endregion
