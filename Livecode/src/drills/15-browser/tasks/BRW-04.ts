import { todo } from '../../../shared/kit'

// #region BRW-04 | Безопасное хранилище | ★★★
/**
 * Обёртка над localStorage: JSON внутри, try/catch снаружи.
 *  - get возвращает fallback, если ключа нет или лежит битый JSON;
 *  - set не бросает при переполнении квоты, а возвращает false;
 *  - remove не бросает никогда.
 */
export type SafeStorage = {
	get: <T>(key: string, fallback: T) => T
	set: (key: string, value: unknown) => boolean
	remove: (key: string) => void
}
export const createSafeStorage = (storage?: Storage): SafeStorage => todo()
// #endregion
