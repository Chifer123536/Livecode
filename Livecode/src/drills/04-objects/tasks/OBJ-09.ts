import { todo } from '../../../shared/kit'

// #region OBJ-09 | Обычный ли это объект | ★★☆
/**
 * true только для объектных литералов и Object.create(null).
 * Массивы, Date, Map, null, функции и экземпляры классов — false.
 *
 * Нужна везде, где пишут рекурсивный обход: без неё код уходит внутрь Date и массивов.
 */
export const isPlainObject = (value: unknown): boolean => todo()
// #endregion
