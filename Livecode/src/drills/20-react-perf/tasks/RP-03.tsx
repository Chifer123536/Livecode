import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-03 | Стабильный объект в пропсах | ★★★
/**
 * Ребёнок мемоизирован и получает объект config = { theme: 'dark' }.
 * Объект НЕ должен пересоздаваться при перерисовке родителя.
 * Ребёнок выводит «Тема: dark».
 */
export function ConfigChild({ config, onRender }: { config: { theme: string } } & Counted) {
	return <p>заглушка</p>
}
export function ConfigParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion
