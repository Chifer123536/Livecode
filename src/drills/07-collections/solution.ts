/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 07. Открывать только после своей попытки.
 */

// #region COL-01 | Подсчёт в Map
/**
 * `map.get(key) ?? 0` — весь приём. С объектом пришлось бы проверять hasOwnProperty,
 * а ключ 'constructor' сломал бы наивную реализацию: у Map прототипа нет.
 */
export const countBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, number> => {
	const result = new Map<K, number>()
	for (const item of items) {
		const key = keyFn(item)
		result.set(key, (result.get(key) ?? 0) + 1)
	}
	return result
}
// #endregion

// #region COL-02 | Группировка в Map
/** Тот же приём, но аккумулятор — массив: достаём, пушим, кладём обратно. */
export const groupToMap = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T[]> => {
	const result = new Map<K, T[]>()
	for (const item of items) {
		const key = keyFn(item)
		const bucket = result.get(key)
		if (bucket) bucket.push(item)
		else result.set(key, [item])
	}
	return result
}
// #endregion

// #region COL-03 | Индекс по ключу
/** set перезаписывает — поэтому «побеждает последний» получается само собой. */
export const indexBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T> => {
	const result = new Map<K, T>()
	for (const item of items) result.set(keyFn(item), item)
	return result
}
// #endregion

// #region COL-04 | Map ↔ объект
/**
 * Object.fromEntries(map) работает, потому что Map сам по себе итерируемый парами.
 * Обратно — Object.entries, он берёт только собственные перечислимые ключи,
 * поэтому мусор из прототипа в Map не протечёт.
 */
export const mapToObject = <V>(map: Map<string, V>): Record<string, V> => Object.fromEntries(map)

export const objectToMap = <V>(source: Record<string, V>): Map<string, V> => new Map(Object.entries(source))
// #endregion

// #region COL-05 | Инвертировать Map
/** Порядок обхода Map — порядок вставки, поэтому «последний побеждает» предсказуем. */
export const invert = <K, V>(map: Map<K, V>): Map<V, K> => {
	const result = new Map<V, K>()
	for (const [key, value] of map) result.set(value, key)
	return result
}
// #endregion

// #region COL-06 | Слить с суммированием
export const mergeSum = <K>(...maps: Map<K, number>[]): Map<K, number> => {
	const result = new Map<K, number>()
	for (const map of maps) {
		for (const [key, value] of map) result.set(key, (result.get(key) ?? 0) + value)
	}
	return result
}
// #endregion

// #region COL-07 | Топ-N по значению
/**
 * [...map] даёт массив пар — дальше обычная сортировка.
 * Array.prototype.sort стабильна по спецификации с ES2019, поэтому равные значения
 * останутся в порядке вставки без дополнительных костылей.
 */
export const topN = <K>(map: Map<K, number>, n: number): Array<[K, number]> =>
	[...map].sort((a, b) => b[1] - a[1]).slice(0, Math.max(0, n))
// #endregion

// #region COL-08 | Объединение множеств
/** Конструктор Set принимает любой итерируемый объект, поэтому спред достаточно. */
export const union = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set([...a, ...b])
// #endregion

// #region COL-09 | Пересечение и разность
/**
 * Фильтрация идёт по меньшему множеству в пересечении — так дешевле,
 * а результат тот же: пересечение симметрично.
 */
export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
	const [small, big] = a.size <= b.size ? [a, b] : [b, a]
	const result = new Set<T>()
	for (const item of small) if (big.has(item)) result.add(item)
	return result
}

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
	const result = new Set<T>()
	for (const item of a) if (!b.has(item)) result.add(item)
	return result
}
// #endregion

// #region COL-10 | Подмножество
/** Ранний выход важен: на большом множестве проверять все элементы незачем. */
export const isSubset = <T>(a: Set<T>, b: Set<T>): boolean => {
	for (const item of a) if (!b.has(item)) return false
	return true
}
// #endregion

// #region COL-11 | Уникальные по ключу
/**
 * Set видимых ключей вместо поиска по результату: проверка O(1) вместо O(n),
 * на десяти тысячах элементов разница уже заметна.
 */
export const uniqueBy = <T, K>(items: T[], keyFn: (item: T) => K): T[] => {
	const seen = new Set<K>()
	const result: T[] = []
	for (const item of items) {
		const key = keyFn(item)
		if (seen.has(key)) continue
		seen.add(key)
		result.push(item)
	}
	return result
}
// #endregion

// #region COL-12 | Кэш по объекту в WeakMap
/**
 * has + get, а не `get(x) ?? compute()`: иначе честно вычисленные undefined и null
 * будут пересчитываться каждый раз.
 * WeakMap держит ключ слабо — как только объект больше никому не нужен,
 * сборщик мусора заберёт и его, и запись кэша. С обычным Map это была бы утечка.
 */
export const memoizeByObject = <A extends object, R>(fn: (arg: A) => R): ((arg: A) => R) => {
	const cache = new WeakMap<A, R>()
	return arg => {
		if (cache.has(arg)) return cache.get(arg) as R
		const value = fn(arg)
		cache.set(arg, value)
		return value
	}
}
// #endregion

// #region COL-13 | Генератор диапазона
/**
 * Условие цикла зависит от знака шага, иначе отрицательный шаг даст бесконечный цикл.
 * step === 0 отсекается сразу по той же причине.
 */
export function* range(start: number, end: number, step = 1): Generator<number> {
	if (step === 0) return
	if (step > 0) {
		for (let i = start; i < end; i += step) yield i
	} else {
		for (let i = start; i > end; i += step) yield i
	}
}
// #endregion

// #region COL-14 | Взять N из итератора
/**
 * for..of с break — и лень сохраняется: у бесконечного генератора мы просто
 * перестаём дёргать next. Никаких [...iterable], он бы завис навсегда.
 */
export const take = <T>(iterable: Iterable<T>, n: number): T[] => {
	if (n <= 0) return []
	const result: T[] = []
	for (const item of iterable) {
		result.push(item)
		if (result.length === n) break
	}
	return result
}
// #endregion

// #region COL-15 | Ленивые map и filter
/**
 * Каждый yield отдаёт значение и замирает до следующего next.
 * Поэтому цепочка lazyFilter(lazyMap(...)) не создаёт ни одного промежуточного массива
 * и спокойно работает поверх бесконечного источника.
 */
export function* lazyMap<T, R>(iterable: Iterable<T>, fn: (item: T) => R): Generator<R> {
	for (const item of iterable) yield fn(item)
}

export function* lazyFilter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): Generator<T> {
	for (const item of iterable) if (predicate(item)) yield item
}
// #endregion

// #region COL-16 | zip двух итераторов
/**
 * Итераторы берутся вручную через Symbol.iterator: только так можно двигать оба
 * синхронно и остановиться, как только закончился любой.
 */
export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
	const ia = a[Symbol.iterator]()
	const ib = b[Symbol.iterator]()
	while (true) {
		const left = ia.next()
		const right = ib.next()
		if (left.done || right.done) return
		yield [left.value, right.value]
	}
}
// #endregion

// #region COL-17 | Свой итерируемый объект
/**
 * Ключевая деталь: [Symbol.iterator] — метод-генератор, он создаёт НОВЫЙ итератор
 * на каждый вызов. Если вернуть уже готовый генератор, второй спред даст пустой массив:
 * итератор одноразовый.
 */
export const makeRange = (start: number, end: number): Iterable<number> => ({
	*[Symbol.iterator]() {
		for (let i = start; i < end; i += 1) yield i
	},
})
// #endregion

// #region COL-18 | Бесконечная последовательность
/** Условия выхода нет вообще — и это нормально, остановку решает потребитель. */
export function* fibonacci(): Generator<number> {
	let [previous, current] = [0, 1]
	while (true) {
		yield previous
		;[previous, current] = [current, previous + current]
	}
}
// #endregion
