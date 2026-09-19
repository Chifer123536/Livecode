import { todo } from '../../../shared/kit'

// #region QZ-17 | this в стрелке внутри метода | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   const obj = {
 *     name: 'obj',
 *     regular() {
 *       const arrow = () => this?.name
 *       return arrow()
 *     },
 *     arrowMethod: function () {
 *       return [1].map(function () { return this?.name })[0]
 *     },
 *   }
 *   console.log(String(obj.regular()))
 *   console.log(String(obj.arrowMethod()))
 */
export const qz17 = (): string[] => todo()
// #endregion
