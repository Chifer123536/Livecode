import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-05 | Управляемый и неуправляемый | ★★★
/**
 * Поле с подписью «Имя», работающее в двух режимах:
 *  - передали value → состояние снаружи, компонент только сообщает об изменении;
 *  - передали только defaultValue → состояние внутри.
 * Переключать режим на лету нельзя — это ошибка использования,
 * и React за это ругается в консоль. Уметь объяснить почему.
 */
export function NameInput({
	value,
	defaultValue,
	onChange,
}: {
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
}) {
	return (
		<label>
			Имя
			<input value={value ?? defaultValue ?? ''} onChange={event => onChange?.(event.target.value)} />
		</label>
	)
}
// #endregion
