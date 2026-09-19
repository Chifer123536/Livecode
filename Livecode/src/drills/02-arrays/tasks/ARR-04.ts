import { todo } from '../../../shared/kit'

// #region ARR-04 | Элемент с максимальным полем | ★★☆
/**
 * Примеры:
 * Вернуть элемент, у которого значение pick максимально. Пустой массив → null.
 * При равенстве побеждает первый.
 *
 *   maxBy([{ n: 1 }, { n: 5 }, { n: 3 }], x => x.n) → { n: 5 }
 */
export const maxBy = <T>(list: T[], pick: (item: T) => number): T | null => todo()
// #endregion
