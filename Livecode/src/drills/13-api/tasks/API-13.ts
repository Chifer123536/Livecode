import { todo } from '../../../shared/kit'
import { ApiError } from './API-06'

// #region API-13 | Распаковка конверта | ★★☆
/**
 * Бэкенд отвечает { data, error }. Достать data, а на error — бросить ApiError.
 * Ответ без конверта считать данными как есть.
 *
 * Примеры:
 *   unwrapEnvelope({ data: [1] })                       → [1]
 *   unwrapEnvelope({ error: { message: 'нет', code: 404 } }) → бросает ApiError(404)
 */
export const unwrapEnvelope = <T>(payload: unknown): T => todo()
// #endregion
