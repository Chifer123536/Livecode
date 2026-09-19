import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-12 | Типизированный EventEmitter | ★★★
/**
 * Карта событий задаёт имя → тип полезной нагрузки.
 * on и emit должны требовать полезную нагрузку ровно того типа,
 * который объявлен для этого события.
 *
 *   emitter.emit('login', { userId: 1 })   ок
 *   emitter.emit('login', { userId: 'a' }) ошибка компиляции
 */
export type EventMap = { login: { userId: number }; logout: undefined; error: string }

export class TypedEmitter<M extends Record<string, unknown>> {
	on<K extends keyof M>(event: K, handler: (payload: M[K]) => void): () => void {
		return todo()
	}
	emit<K extends keyof M>(event: K, payload: M[K]): void {
		return todo()
	}
}
// #endregion
