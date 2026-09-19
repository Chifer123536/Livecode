import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-08 | children как пропс | ★★★
/**
 * Обёртка с собственным состоянием (кнопка «+1» и текст «Счёт: N»)
 * не должна перерисовывать дорогое содержимое.
 * Решение — принять его через children: React создаёт этот элемент СНАРУЖИ,
 * и при перерисовке обёртки ссылка на него не меняется.
 */
export function Expensive({ onRender }: Counted) {
	return <p>заглушка</p>
}
export function Wrapper({ children, onRender }: { children: ReactNode } & Counted) {
	return <div>заглушка</div>
}
// #endregion
