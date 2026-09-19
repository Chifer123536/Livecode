import { todo } from '../../../shared/kit'

// #region BRW-06 | Подписка с отпиской | ★★☆
/**
 * addEventListener, возвращающий функцию снятия. Так подписку нельзя забыть отменить:
 * она всегда в одной переменной с обработчиком.
 *
 *   const off = onEvent(button, 'click', handler)
 *   off()
 */
export const onEvent = <K extends keyof HTMLElementEventMap>(
	target: HTMLElement,
	type: K,
	handler: (event: HTMLElementEventMap[K]) => void
): (() => void) => todo()
// #endregion
