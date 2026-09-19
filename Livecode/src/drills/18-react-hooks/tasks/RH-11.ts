import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-11 | useInterval | ★★★
/**
 * Запускает callback каждые delay мс. delay === null ставит интервал на паузу.
 * Свежий callback должен подхватываться БЕЗ перезапуска интервала — для этого нужен ref.
 * Это канонический хук Дэна Абрамова, его любят спрашивать.
 */
export function useInterval(callback: () => void, delay: number | null): void {
	return todo()
}
// #endregion
