import { todo } from '../../../shared/kit'

// #region OBJ-27 | Объект и Map туда-обратно | ★☆☆
/**
 * Примеры:
 *   toMap({ a: 1 })            → Map { 'a' => 1 }
 *   fromMap(new Map([['a', 1]])) → { a: 1 }
 *
 * Когда Map лучше объекта: ключи не только строки, порядок гарантирован,
 * есть size, нет прототипных сюрпризов.
 */
export const toMap = <V>(obj: Record<string, V>): Map<string, V> => todo()
export const fromMap = <V>(map: Map<string, V>): Record<string, V> => todo()
// #endregion
