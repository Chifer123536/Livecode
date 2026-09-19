import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-09 | Граница ошибок | ★★★
/**
 * Единственное, что до сих пор требует классового компонента.
 *  - поймав ошибку, рисует <p>Что-то сломалось</p> и кнопку «Повторить»;
 *  - «Повторить» сбрасывает состояние и снова показывает детей;
 *  - если передан onError — вызвать его с ошибкой.
 * Границы НЕ ловят ошибки в обработчиках событий и в асинхронном коде — знать обязательно.
 */
export class ErrorBoundary extends Component<
	{ children: ReactNode; onError?: (error: Error) => void },
	{ error: Error | null }
> {
	state = { error: null as Error | null }

	render() {
		return this.props.children
	}
}
// #endregion
