import { todo } from '../../../shared/kit'
import { get } from './UTL-10'
import { set } from './UTL-11'

// #region UTL-13 | LRU-кэш | ★★★
/**
 * Кэш фиксированного размера: при переполнении выбрасывается элемент,
 * к которому дольше всего не обращались. get тоже считается обращением.
 *
 * Практика: кэш ответов, кэш вычислений, классическая задача с собеса.
 * Подсказка: Map в JS помнит порядок вставки, и этого достаточно.
 */
export class LRUCache<K, V> {
	constructor(public readonly capacity: number) {}
	get(key: K): V | undefined {
		return todo()
	}
	set(key: K, value: V): void {
		return todo()
	}
	has(key: K): boolean {
		return todo()
	}
	get size(): number {
		return todo()
	}
	keys(): K[] {
		return todo()
	}
}
// #endregion
