import { todo } from '../../../shared/kit'

// #region DAT-17 | Переименовать поля | ★★☆
/**
 * Привести ответ бэкенда к своим именам. Поля, которых нет в карте, выбрасываются.
 *
 *   renameFields([{ user_name: 'Ян', age: 30 }], { user_name: 'name' }) → [{ name: 'Ян' }]
 */
export const renameFields = (
	items: Array<Record<string, unknown>>,
	map: Record<string, string>
): Array<Record<string, unknown>> => todo()
// #endregion
