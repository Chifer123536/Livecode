import { todo } from '../../../shared/kit'
import type { Validator } from './_pack'
import { required } from './VAL-11'

// #region VAL-13 | Валидация формы по схеме | ★★★
/**
 * Примеры:
 * Схема: поле → список валидаторов. Результат — объект с ошибками только по проблемным полям
 * и флаг valid.
 *
 *   validateForm({ name: '' }, { name: [required('Введите имя')] })
 *     → { valid: false, errors: { name: 'Введите имя' } }
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>
export type Schema<T> = { [K in keyof T]?: Array<Validator<T[K]>> }
export const validateForm = <T extends object>(
	values: T,
	schema: Schema<T>
): { valid: boolean; errors: FormErrors<T> } => todo()
// #endregion
