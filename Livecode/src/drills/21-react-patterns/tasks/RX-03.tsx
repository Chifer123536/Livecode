import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-03 | Render-props | ★★☆
/**
 * Компонент отдаёт состояние, а разметку рисует вызывающий:
 *
 *   <Toggle>{({ on, toggle }) => <button onClick={toggle}>{on ? 'вкл' : 'выкл'}</button>}</Toggle>
 *
 * Приём старый, но именно из него выросли хуки — уметь объяснить связь.
 */
export function Toggle({
	initial,
	children,
}: {
	initial?: boolean
	children: (state: { on: boolean; toggle: () => void }) => ReactNode
}) {
	return <>{children({ on: initial ?? false, toggle: () => undefined })}</>
}
// #endregion
