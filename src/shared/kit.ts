/**
 * Общий инструментарий тренажёра. Импортируется во всех паках.
 */

export class NotImplementedError extends Error {
	constructor(hint?: string) {
		super(hint ? `не реализовано: ${hint}` : 'не реализовано')
		this.name = 'NotImplementedError'
	}
}

/** Заглушка тела задачи. Возвращает never, поэтому подходит под любую сигнатуру. */
export const todo = (hint?: string): never => {
	throw new NotImplementedError(hint)
}

/** Пауза. Нужна в асинхронных задачах и тестах. */
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** Детерминированный псевдослучайный генератор — чтобы тесты не плавали. */
export function seededRandom(seed: number): () => number {
	let state = seed >>> 0 || 1
	return () => {
		state ^= state << 13
		state ^= state >>> 17
		state ^= state << 5
		state >>>= 0
		return state / 0xffffffff
	}
}

/** Счётчик вызовов — чтобы проверять «сколько раз дёрнули функцию». */
export function spy<F extends (...args: never[]) => unknown>(fn?: F) {
	const calls: unknown[][] = []
	const wrapped = (...args: unknown[]) => {
		calls.push(args)
		return fn?.(...(args as never[]))
	}
	return Object.assign(wrapped, {
		calls,
		get count() {
			return calls.length
		},
		get lastArgs() {
			return calls.at(-1)
		},
	})
}
