import { todo } from '../../../shared/kit'

// #region API-09 | Какие ошибки повторять | ★★☆
/**
 * true для временных: 408, 429 и любые 5xx. Для 4xx (кроме 408 и 429) — false:
 * повторять запрос с неправильным телом бессмысленно.
 * 0 — сетевой сбой, его повторять можно.
 */
export const isRetriable = (status: number): boolean => todo()
// #endregion
