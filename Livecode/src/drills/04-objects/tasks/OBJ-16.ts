import { todo } from '../../../shared/kit'

// #region OBJ-16 | Объект в query-строку | ★★☆
/**
 * Пропустить undefined и null. Значения кодировать через encodeURIComponent.
 * Массив превращается в повторяющийся ключ.
 *
 *   toQuery({ a: 1, b: 'да', c: null }) → 'a=1&b=%D0%B4%D0%B0'
 *   toQuery({ tag: ['a', 'b'] })        → 'tag=a&tag=b'
 */
export const toQuery = (params: Record<string, string | number | boolean | null | undefined | string[]>): string =>
	todo()
// #endregion
