import { todo } from '../../../shared/kit'
import { fetchJson } from './API-07'

// #region API-18 | Мини-клиент | ★★★
/**
 * Обёртка с базовым URL и заголовками по умолчанию:
 *  - get(path, params) собирает query;
 *  - post(path, body) сериализует JSON и ставит Content-Type;
 *  - заголовки из вызова перекрывают дефолтные.
 * Внутри — fetchJson.
 */
export type ApiClient = {
	get: <T>(path: string, params?: Record<string, unknown>) => Promise<T>
	post: <T>(path: string, body: unknown, options?: RequestInit) => Promise<T>
}
export const createApiClient = (baseUrl: string, defaultHeaders?: Record<string, string>): ApiClient => todo()
// #endregion
