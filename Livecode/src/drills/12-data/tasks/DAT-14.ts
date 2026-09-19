import { todo } from '../../../shared/kit'

// #region DAT-14 | Разница двух списков | ★★★
/**
 * Что изменилось между старым и новым состоянием. Сравнение по id,
 * «изменился» — если хотя бы одно поле отличается (сравнение поверхностное).
 *
 * Примеры:
 *   diffById(previous, next) → { added: [...], removed: [...], updated: [...] }
 */
export type Diff<T> = { added: T[]; removed: T[]; updated: T[] }
export const diffById = <T extends { id: number }>(previous: T[], next: T[]): Diff<T> => todo()
// #endregion
