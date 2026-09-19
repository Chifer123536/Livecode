import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-17 | Поле формы с подписью и ошибкой | ★★☆
/**
 * Доступная связка, которую просят на каждом втором собесе:
 *  - label связан с input через id (брать из useId, а не придумывать руками);
 *  - есть error → <p role="alert"> с текстом, input получает aria-invalid="true"
 *    и aria-describedby с id этого сообщения;
 *  - нет ошибки → ни alert, ни aria-invalid.
 */
export function FormField({
	label,
	error,
	value,
	onChange,
}: {
	label: string
	error?: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<label>
			{label}
			<input value={value} onChange={event => onChange(event.target.value)} />
		</label>
	)
}
// #endregion
