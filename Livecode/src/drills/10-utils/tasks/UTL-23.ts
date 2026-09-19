import { todo } from '../../../shared/kit'

// #region UTL-23 | Группировка с глубоким ключом | ★★☆
/**
 * Сгруппировать по значению вложенного поля, заданного путём.
 * Элементы без такого поля попадают в группу 'unknown'.
 *
 *   groupByPath(users, 'address.city')
 */
export const groupByPath = <T extends object>(list: T[], path: string): Record<string, T[]> => todo()
// #endregion
