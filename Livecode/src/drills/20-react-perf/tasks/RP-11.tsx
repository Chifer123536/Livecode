import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-11 | Подписка на внешний стор | ★★★
/**
 * Подписаться на внешнее хранилище через useSyncExternalStore.
 * Это штатный способ связать React с любым сторонним стейт-менеджером,
 * он корректно работает с конкурентным рендерингом (в отличие от useEffect + setState).
 *
 * Вывести «Значение: N». Компонент перерисовывается только при изменении значения.
 */
export type ExternalStore = {
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => number
}
export function StoreValue({ store, onRender }: { store: ExternalStore } & Counted) {
	return <p>заглушка</p>
}
// #endregion
