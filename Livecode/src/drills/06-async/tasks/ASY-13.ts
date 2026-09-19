import { todo } from '../../../shared/kit'

// #region ASY-13 | Отмена через AbortController | ★★★
/**
 * Промис, который резолвится через ms, но отклоняется сразу,
 * если signal получил abort. Ошибка отмены: имя 'AbortError'.
 * Не забудь снять слушатель, иначе он останется висеть на сигнале.
 */
export const cancellableDelay = (ms: number, signal: AbortSignal): Promise<void> => todo()
// #endregion
