import { todo } from '../../../shared/kit'

// #region BRW-14 | Куки | ★★★
/**
 * Чтение, запись и удаление. Значение кодируется, удаление — это запись
 * с датой в прошлом (отдельного API нет).
 */
export const getCookie = (name: string): string | null => todo()
export const setCookie = (name: string, value: string, days?: number): void => todo()
export const deleteCookie = (name: string): void => todo()
// #endregion
