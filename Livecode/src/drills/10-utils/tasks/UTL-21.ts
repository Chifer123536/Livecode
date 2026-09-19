import { todo } from '../../../shared/kit'

// #region UTL-21 | Счётчик вызовов в окне | ★★★
/**
 * Ограничитель частоты: разрешить не более limit вызовов за windowMs.
 * Вернуть функцию, которая отвечает true (можно) или false (превышен лимит).
 * Окно скользящее: старые отметки времени выпадают.
 *
 * Практика: защита от спама кнопкой, клиентский rate limit.
 */
export const rateLimiter = (limit: number, windowMs: number): (() => boolean) => todo()
// #endregion
