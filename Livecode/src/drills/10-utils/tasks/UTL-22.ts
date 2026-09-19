import { todo } from '../../../shared/kit'
import { get } from './UTL-10'
import { set } from './UTL-11'

// #region UTL-22 | Наблюдаемое значение | ★★★
/**
 * Мини-стор: get, set, subscribe. subscribe возвращает отписку.
 * Подписчики вызываются только при РЕАЛЬНОМ изменении (сравнение через Object.is).
 *
 * Практика: это ядро любого стейт-менеджера в двадцать строк.
 */
export type Store<T> = {
	get: () => T
	set: (next: T) => void
	subscribe: (listener: (value: T) => void) => () => void
}
export const createStore = <T>(initial: T): Store<T> => todo()
// #endregion
