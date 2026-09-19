import { todo } from '../../../shared/kit'

// #region API-08 | Таймаут через AbortController | ★★★
/**
 * Оборвать запрос, если он длится дольше ms. Таймер снимать в finally,
 * иначе он продержит процесс живым после успешного ответа.
 * Если снаружи уже передан signal — его отмена тоже должна работать.
 */
export const fetchWithTimeout = (url: string, ms: number, options?: RequestInit): Promise<Response> => todo()
// #endregion
