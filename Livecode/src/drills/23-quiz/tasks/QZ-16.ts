import { todo } from '../../../shared/kit'

// #region QZ-16 | this в методе и в оторванной функции | ★★☆
/**
 * В строгом режиме (ES-модуль):
 *
 *   const obj = { name: 'obj', getName() { return this?.name } }
 *   console.log(String(obj.getName()))
 *   const loose = obj.getName
 *   console.log(String(loose()))
 */
export const qz16 = (): string[] => todo()
// #endregion
