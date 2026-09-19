import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-13 | useLocalStorage | ★★★
/**
 * Состояние, которое переживает перезагрузку страницы.
 * Возвращает [value, setValue] с той же сигнатурой, что useState (включая форму с функцией).
 * Битый JSON в хранилище не должен ронять приложение — вернуть initial.
 * Доступ к localStorage оборачивать в try/catch: в приватном режиме он может бросать.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
	return todo()
}
// #endregion
