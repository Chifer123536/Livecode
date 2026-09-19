import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-01 | Мемоизация дочернего компонента | ★★☆
/**
 * Parent держит счётчик и рендерит Child с НЕИЗМЕННЫМ пропсом title.
 * Сделать так, чтобы клик по кнопке «+1» перерисовывал только Parent, но не Child.
 *
 * Кнопка: «+1». Parent показывает «Счёт: N», Child показывает свой title.
 */
export function Child({ title, onRender }: { title: string } & Counted) {
	return <p>заглушка</p>
}
export function Parent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion
