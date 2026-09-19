import { todo } from '../../../shared/kit'

// #region DAT-21 | Итоговая строка | ★★☆
/**
 * Нижняя строка таблицы: по числовым полям сумма, по остальным — прочерк.
 * Набор полей задаётся явно. Поле считается числовым, только если оно числовое во ВСЕХ строках.
 * Пустой список — прочерки во всех полях.
 *
 *   summaryRow(items, ['price', 'title']) → { price: 300, title: '—' }
 */
export const summaryRow = <T extends object>(items: T[], keys: Array<keyof T>): Record<string, number | string> =>
	todo()
// #endregion
