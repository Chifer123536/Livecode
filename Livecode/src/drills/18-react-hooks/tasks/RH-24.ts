import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-24 | useFetchJson | ★★★
/**
 * Загрузка JSON по url: { data, error, loading, reload }.
 * Требования:
 *  - при смене url предыдущий запрос отменяется через AbortController;
 *  - ответ отменённого запроса в состояние не попадает (гонка);
 *  - AbortError не показывается как ошибка;
 *
 * Примеры:
 *  - !response.ok → ошибка вида 'HTTP 500'.
 */
export type FetchApi<T> = { data: T | null; error: string | null; loading: boolean; reload: () => void }
export function useFetchJson<T>(url: string): FetchApi<T> {
	return todo()
}
// #endregion
