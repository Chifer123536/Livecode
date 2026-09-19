import { todo } from '../../../shared/kit'

// #region DAT-06 | Номера страниц с многоточием | ★★★
/**
 * Классический компонент пагинации. Всегда первая и последняя, вокруг текущей — по одной соседней,
 * разрывы обозначаются null.
 *
 *   pageNumbers(1, 10)  → [1, 2, null, 10]
 *   pageNumbers(5, 10)  → [1, null, 4, 5, 6, null, 10]
 *   pageNumbers(3, 5)   → [1, 2, 3, 4, 5]
 *   pageNumbers(1, 1)   → [1]
 *
 * Многоточие ставится только вместо ДВУХ и более пропущенных номеров.
 */
export const pageNumbers = (current: number, pages: number): Array<number | null> => todo()
// #endregion
