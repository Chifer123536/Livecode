import type { ReactNode } from 'react'

// #region RB-17 | Вкладки | ★★☆
/**
 * Вкладки по правилам доступности: обёртка role="tablist", кнопки role="tab",
 * у активной aria-selected="true", у остальных "false".
 * Ниже — <p> с содержимым активной вкладки. По умолчанию активна первая.
 *
 *   tabs = [{ id: 'a', title: 'Первая', content: 'Раз' }, ...]
 */
export type Tab = { id: string; title: string; content: string }
export function Tabs({ tabs }: { tabs: Tab[] }) {
	return <div>заглушка</div>
}
// #endregion
