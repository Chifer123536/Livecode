import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-11 | Императивная ручка | ★★★
/**
 * Иногда родителю нужно дёрнуть компонент напрямую: сфокусировать поле после ошибки.
 * Наружу отдаём ТОЛЬКО разрешённые методы — focus() и clear(), а не весь DOM-узел.
 * В React 19 ref приходит обычным пропсом, forwardRef не нужен; сам объект ручки
 * собирается через useImperativeHandle. Поле подписано словом «Имя».
 */
export type TextInputHandle = { focus: () => void; clear: () => void }

export function TextInput(_props: { label: string; ref?: Ref<TextInputHandle> }) {
	return <input />
}
// #endregion
