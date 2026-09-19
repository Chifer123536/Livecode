import { todo } from '../../../shared/kit'
import type { Validator } from './_pack'

// #region VAL-11 | Готовые валидаторы | ★★☆
/**
 * Фабрики, возвращающие валидатор. Текст ошибки задаётся снаружи —
 * иначе форму нельзя перевести и нельзя переиспользовать.
 *
 * Примеры:
 *   required('Введите имя')('')      → 'Введите имя'
 *   minLength(3, 'Коротко')('абв')   → null
 */
export const required = (message: string): Validator<unknown> => todo()
export const minLength = (min: number, message: string): Validator<string> => todo()
export const pattern = (regexp: RegExp, message: string): Validator<string> => todo()
// #endregion
