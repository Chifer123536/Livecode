import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'
import type { Result } from './TS-08'

// #region TS-09 | Безопасный разбор JSON | ★★★
/**
 * Распарсить строку и проверить, что это объект с нужной формой.
 * Возвращает Result<User, string>. Никаких `as User` — только проверки.
 * Ошибки: 'битый json' при исключении парсинга, 'не тот формат' при несовпадении формы.
 */
export type User = { id: number; name: string }
export const parseUser = (raw: string): Result<User, string> => todo()
// #endregion
