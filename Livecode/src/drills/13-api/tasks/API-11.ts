import { todo } from '../../../shared/kit'

// #region API-11 | Запрос с повторами | ★★★
/**
 * Повторять ТОЛЬКО ретраибельные ответы, не больше attempts раз всего.
 * Пауза: Retry-After, если сервер его прислал, иначе baseDelay с удвоением.
 * Последний ответ возвращается как есть, даже если он неуспешный.
 */
export const fetchRetry = (url: string, attempts: number, baseDelay?: number): Promise<Response> => todo()
// #endregion
