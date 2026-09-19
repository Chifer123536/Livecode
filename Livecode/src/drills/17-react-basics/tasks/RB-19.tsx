import type { ReactNode } from 'react'

// #region RB-19 | Ловушка нуля | ★★☆
/**
 * Показать «Товаров: N», а если count === 0 — ничего не рендерить вообще.
 * Наивное {count && <p>...} отрисует «0» на экране. Задача — не допустить этого.
 */
export function ZeroTrap({ count }: { count: number }) {
	return <div>заглушка</div>
}
// #endregion
