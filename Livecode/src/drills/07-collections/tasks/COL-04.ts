import { todo } from '../../../shared/kit'

// #region COL-04 | Map ↔ объект | ★★☆
/**
 * Два преобразования в обе стороны. В objectToMap брать только собственные ключи.
 *
 * Примеры:
 *   mapToObject(new Map([['a', 1]])) → { a: 1 }
 *   objectToMap({ a: 1 })            → Map { 'a' => 1 }
 */
export const mapToObject = <V>(map: Map<string, V>): Record<string, V> => todo()
export const objectToMap = <V>(source: Record<string, V>): Map<string, V> => todo()
// #endregion
