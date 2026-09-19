import { todo } from '../../../shared/kit'
import type { Normalized } from './OBJ-12'

// #region OBJ-13 | Обратно в список | ★☆☆
/**
 * Собрать список из нормализованной формы, сохранив порядок allIds.
 * Идентификатор без записи в byId пропускается.
 */
export const denormalize = <T>(data: Normalized<T>): T[] => todo()
// #endregion
