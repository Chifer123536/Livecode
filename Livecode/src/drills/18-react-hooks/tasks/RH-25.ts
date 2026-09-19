import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-25 | useForm | ★★★
/**
 * Мини-аналог react-hook-form.
 * Возвращает { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, reset }.
 * errors — ПРОИЗВОДНОЕ от values через validate, а не отдельное состояние.
 * handleChange читает event.target.name и event.target.value.
 * handleSubmit(onValid) возвращает обработчик формы: preventDefault, пометить всё как touched,
 * и вызвать onValid(values) только если ошибок нет.
 */
export type FormApi<V> = {
	values: V
	errors: Partial<Record<keyof V, string>>
	touched: Partial<Record<keyof V, boolean>>
	handleChange: (event: { target: { name: string; value: string } }) => void
	handleBlur: (event: { target: { name: string } }) => void
	handleSubmit: (onValid: (values: V) => void) => (event: { preventDefault: () => void }) => void
	isValid: boolean
	reset: () => void
}
export function useForm<V extends Record<string, string>>(
	initial: V,
	validate: (values: V) => Partial<Record<keyof V, string>>
): FormApi<V> {
	return todo()
}
// #endregion
