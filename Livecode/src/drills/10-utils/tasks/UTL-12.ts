import { todo } from '../../../shared/kit'
import { once } from './UTL-04'

// #region UTL-12 | EventEmitter | ★★★
/**
 * on / once / off / emit.
 *  - on возвращает функцию отписки;
 *  - отписка ВНУТРИ обработчика не должна ломать текущий проход emit;
 *  - off по исходной ссылке обязан снимать и обработчик, навешенный через once;
 *  - emit по событию без подписчиков не падает.
 */
export type Handler = (...args: unknown[]) => void
export class EventEmitter {
	on(event: string, handler: Handler): () => void {
		return todo()
	}
	once(event: string, handler: Handler): () => void {
		return todo()
	}
	off(event: string, handler: Handler): void {
		return todo()
	}
	emit(event: string, ...args: unknown[]): void {
		return todo()
	}
	listenerCount(event: string): number {
		return todo()
	}
}
// #endregion
