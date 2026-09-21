import { todo } from '../../../shared/kit'

// #region TSB-11 | Сужение через in | ★★☆
/**
 * Позвать животное. У собаки есть bark, у кошки — meow.
 * Общих полей нет, различать приходится по наличию свойства.
 *
 * Примеры:
 *   speak({ bark: () => 'гав' }) → 'гав'
 *   speak({ meow: () => 'мяу' }) → 'мяу'
 */
export type Dog = { bark: () => string }
export type Cat = { meow: () => string }

export const speak = (animal: Dog | Cat): string => todo()
// #endregion
