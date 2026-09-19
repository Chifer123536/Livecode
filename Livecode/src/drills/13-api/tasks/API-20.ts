import { todo } from '../../../shared/kit'

// #region API-20 | Объект в FormData | ★★☆
/**
 * Для отправки файлов. undefined и null пропускаем, массив — несколько значений
 * с одним ключом, остальное приводим к строке.
 *
 *   toFormData({ title: 'a', tags: ['x', 'y'], skip: null })
 */
export const toFormData = (data: Record<string, unknown>): FormData => todo()
// #endregion
