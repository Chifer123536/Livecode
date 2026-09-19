import { todo } from '../../../shared/kit'

// #region API-10 | Заголовок Retry-After | ★★☆
/**
 * Сервер говорит, когда возвращаться: либо число секунд, либо HTTP-дата.
 * Вернуть задержку в миллисекундах, для мусора и прошедшей даты — 0.
 *
 *   parseRetryAfter('3', now)                                → 3000
 *   parseRetryAfter(new Date(now + 5000).toUTCString(), now) → примерно 5000
 *   parseRetryAfter(null, now)                               → 0
 */
export const parseRetryAfter = (header: string | null, now: number): number => todo()
// #endregion
