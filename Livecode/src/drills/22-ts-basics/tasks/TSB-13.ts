import { todo } from '../../../shared/kit'

// #region TSB-13 | Свой type guard | ★★☆
/**
 * isString — предикат: возврат value is string говорит компилятору,
 * что после проверки значение можно считать строкой.
 * onlyStrings отфильтровывает из массива неизвестных только строки.
 *
 * Примеры:
 *   isString('a')                → true
 *   onlyStrings([1, 'a', null])  → ['a']
 */
export const isString = (value: unknown): value is string => todo()

export const onlyStrings = (list: unknown[]): string[] => todo()
// #endregion
