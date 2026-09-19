import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-07 | Ref вместо состояния | ★★☆
/**
 * Считать клики, но НЕ показывать счётчик — он нужен только при нажатии «Показать».
 * Каждый клик по «Клик» не должен вызывать перерисовку.
 * После «Показать» вывести «Кликов: N».
 */
export function ClickTracker({ onRender }: Counted) {
	return <div>заглушка</div>
}
// #endregion
