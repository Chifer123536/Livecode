import { todo } from '../../../shared/kit'

// #region REC-04 | Фибоначчи с мемоизацией | ★★☆
/**
 * Наивная рекурсия здесь экспоненциальна: fib(40) считается секундами.
 * Кэш по аргументу превращает её в линейную. Тест это проверяет по числу вызовов.
 *
 *   fibMemo(40) → 102334155
 */
export const fibMemo = (n: number, cache?: Map<number, number>): number => todo()
// #endregion
