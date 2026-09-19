import { todo } from '../../../shared/kit'

// #region BRW-05 | Хранилище со сроком годности | ★★★
/**
 * Значение живёт ttl миллисекунд. Просроченное читается как null И УДАЛЯЕТСЯ из хранилища,
 * иначе мусор копится до конца жизни браузера. Текущее время — аргументом.
 */
export type TtlStorage = {
	set: (key: string, value: unknown, ttl: number, now: number) => void
	get: <T>(key: string, now: number) => T | null
}
export const createTtlStorage = (storage?: Storage): TtlStorage => todo()
// #endregion
