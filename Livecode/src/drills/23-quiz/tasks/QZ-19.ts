import { todo } from '../../../shared/kit'

// #region QZ-19 | Порядок в классе | ★★☆
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   class A { constructor() { console.log('A') } }
 *   class B extends A { constructor() { console.log('до super'); super(); console.log('после super') } }
 *   new B()
 */
export const qz19 = (): string[] => todo()
// #endregion
