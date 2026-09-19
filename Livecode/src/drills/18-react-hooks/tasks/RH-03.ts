import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-03 | useInput | ★☆☆
/**
 * Состояние текстового поля вместе с готовым обработчиком.
 * Возвращает { value, onChange, reset }, где onChange принимает событие инпута.
 */
export type InputApi = {
	value: string
	onChange: (event: { target: { value: string } }) => void
	reset: () => void
}
export function useInput(initial = ''): InputApi {
	return todo()
}
// #endregion
