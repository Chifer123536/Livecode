import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-02 | Стабильный обработчик | ★★★
/**
 * То же самое, но ребёнку передаётся колбэк onAction.
 * Без стабилизации новая стрелка на каждом рендере ломает memo.
 * Ребёнок мемоизирован и имеет кнопку «Действие», вызывающую onAction.
 *
 * Подсказка: setCount(c => c + 1) позволяет обойтись пустым массивом зависимостей.
 */
export function ActionChild({ onAction, onRender }: { onAction: () => void } & Counted) {
	return <button>заглушка</button>
}
export function ActionParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion
