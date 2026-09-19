import { todo } from '../../../shared/kit'

// #region UTL-10 | get по пути | ★★☆
/**
 * Достать значение по строковому пути. Путь поддерживает точки и индексы массива.
 * Не нашли — вернуть fallback. Значение undefined тоже считается «не нашли»,
 * а вот null, 0, '' и false — нашли.
 *
 *   get(obj, 'a.b[0].c', 'нет')
 */
export const get = (obj: unknown, path: string, fallback?: unknown): unknown => todo()
// #endregion
