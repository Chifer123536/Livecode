import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-01 | useToggle | ★☆☆
/**
 * Булево состояние с переключателем.
 * Возвращает кортеж: [value, toggle, setValue].
 *
 *   const [open, toggleOpen, setOpen] = useToggle(false)
 */
export function useToggle(initial = false): [boolean, () => void, (next: boolean) => void] {
	return todo()
}
// #endregion
