import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-06 | Форма на useReducer | ★★★
/**
 * Чистый редьюсер формы — его и проверяют отдельно от разметки.
 * Действия: change (name, value), blur (name), submit, reset.
 *  - change пишет значение;
 *  - blur помечает поле тронутым;
 *  - submit ставит submitted: true и помечает тронутыми ВСЕ поля;
 *  - reset возвращает начальное состояние.
 * Редьюсер обязан быть чистым: новый объект, без мутаций.
 */
export type FormState = {
	values: Record<string, string>
	touched: Record<string, boolean>
	submitted: boolean
}
export type FormAction =
	| { type: 'change'; name: string; value: string }
	| { type: 'blur'; name: string }
	| { type: 'submit' }
	| { type: 'reset' }

export const initialFormState = (values: Record<string, string>): FormState => ({
	values,
	touched: {},
	submitted: false,
})

export function formReducer(state: FormState, action: FormAction): FormState {
	return state
}
// #endregion
