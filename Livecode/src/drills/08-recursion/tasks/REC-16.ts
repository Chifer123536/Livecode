import { todo } from '../../../shared/kit'

// #region REC-16 | Значение по пути | ★★☆
/**
 * Достать вложенное значение по строке пути. Нет такого пути — вернуть fallback.
 * Индексы массивов — такие же сегменты.
 *
 * Примеры:
 *   deepGet({ a: { b: [{ c: 1 }] } }, 'a.b.0.c')      → 1
 *   deepGet({ a: 1 }, 'a.b.c', 'нет')                 → 'нет'
 */
export const deepGet = (source: unknown, path: string, fallback?: unknown): unknown => todo()
// #endregion
