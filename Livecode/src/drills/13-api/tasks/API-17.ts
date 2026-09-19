import { todo } from '../../../shared/kit'

// #region API-17 | Новый запрос отменяет прошлый | ★★★
/**
 * Обёртка для поиска по мере ввода: каждый вызов отменяет предыдущий через AbortController
 * и передаёт свежий signal в fn. Отменённый промис должен отклоняться,
 * а не «зависать» навсегда.
 */
export const cancelPrevious = <T>(fn: (signal: AbortSignal) => Promise<T>): (() => Promise<T>) => todo()
// #endregion
