import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-10 | Портал | ★★★
/**
 * Модалка, которая рендерится в document.body, а не в месте вызова —
 * иначе overflow: hidden у родителя обрежет её.
 *  - open: false → не рендерить ничего;
 *  - role="dialog", aria-modal="true", заголовок из title;
 *  - Escape и клик по фону (data-testid="overlay") вызывают onClose;
 *  - клик по содержимому окна onClose НЕ вызывает.
 */
export function Modal({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean
	title: string
	onClose: () => void
	children: ReactNode
}) {
	return open ? <div>{children}</div> : null
}
// #endregion
