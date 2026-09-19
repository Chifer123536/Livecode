/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 10. Открывать только после своей попытки.
 */

// #region UTL-01 | debounce
/**
 * Замыкание хранит timer. Каждый вызов гасит предыдущий таймер и ставит новый —
 * поэтому срабатывает только последний.
 * Обычная function, а не стрелка: стрелка забрала бы this из места объявления,
 * и obj.method() потерял бы контекст. Внутри setTimeout наоборот нужна стрелка,
 * чтобы this остался тем же, что и в вызове.
 * Тип таймера — ReturnType<typeof setTimeout>: в браузере это number, в Node — объект.
 */
export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void }

export const debounce = <A extends unknown[]>(fn: (...args: A) => void, delay: number): Debounced<A> => {
	let timer: ReturnType<typeof setTimeout> | null = null

	function debounced(this: unknown, ...args: A): void {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			timer = null
			fn.apply(this, args)
		}, delay)
	}

	debounced.cancel = () => {
		if (timer) clearTimeout(timer)
		timer = null
	}

	return debounced as Debounced<A>
}
// #endregion

// #region UTL-02 | throttle
/**
 * Вариант по метке времени: не держит таймеров и не требует очистки.
 * Разница с debounce одной фразой: debounce ждёт тишины, throttle пропускает по расписанию.
 * Поиск при вводе — debounce. Обработчик scroll — throttle.
 */
export const throttle = <A extends unknown[]>(fn: (...args: A) => void, interval: number): ((...args: A) => void) => {
	let lastCall = 0

	return function throttled(this: unknown, ...args: A): void {
		const now = Date.now()
		if (now - lastCall < interval) return
		lastCall = now
		fn.apply(this, args)
	}
}
// #endregion

// #region UTL-03 | throttle с хвостом
/**
 * Добавляется отложенный вызов на конец окна с последними аргументами.
 * Без него теряется финальное состояние: прогресс замрёт на 97%, хотя загрузка уже завершилась.
 */
export const throttleTrailing = <A extends unknown[]>(
	fn: (...args: A) => void,
	interval: number
): ((...args: A) => void) => {
	let lastCall = 0
	let timer: ReturnType<typeof setTimeout> | null = null
	let lastArgs: A | null = null

	return function throttled(this: unknown, ...args: A): void {
		const now = Date.now()
		const remaining = interval - (now - lastCall)
		lastArgs = args
		const context = this

		if (remaining <= 0) {
			if (timer) {
				clearTimeout(timer)
				timer = null
			}
			lastCall = now
			fn.apply(context, args)
			return
		}

		if (!timer) {
			timer = setTimeout(() => {
				lastCall = Date.now()
				timer = null
				if (lastArgs) fn.apply(context, lastArgs)
			}, remaining)
		}
	}
}
// #endregion

// #region UTL-04 | once
/** Флаг и сохранённый результат в замыкании. Всё остальное — лишнее. */
export const once = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
	let called = false
	let result: R

	return (...args: A): R => {
		if (!called) {
			called = true
			result = fn(...args)
		}
		return result
	}
}
// #endregion

// #region UTL-05 | memoize
/**
 * Map, а не обычный объект: у объекта есть прототипные ключи, а ключ приводится к строке,
 * из-за чего 1 и '1' схлопнутся.
 * Проверка через has, а не через `cache[key] !== undefined`: иначе функция,
 * возвращающая undefined, будет пересчитываться каждый раз.
 * Ключ из JSON.stringify прост, но не идеален: порядок ключей объекта влияет на строку,
 * а функции и Symbol в JSON не попадают. На собесе это стоит проговорить.
 */
export const memoize = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
	const cache = new Map<string, R>()

	return (...args: A): R => {
		const key = JSON.stringify(args)
		if (cache.has(key)) return cache.get(key) as R
		const value = fn(...args)
		cache.set(key, value)
		return value
	}
}
// #endregion

// #region UTL-06 | memoize по ссылке
/**
 * WeakMap держит ключ СЛАБО: как только на объект не осталось других ссылок,
 * сборщик мусора вычистит и объект, и запись в кэше. Обычный Map держал бы объект
 * вечно — готовая утечка памяти.
 * Плата: WeakMap нельзя перебрать и у него нет size.
 */
export const memoizeByRef = <T extends object, R>(fn: (arg: T) => R): ((arg: T) => R) => {
	const cache = new WeakMap<T, R>()

	return (arg: T): R => {
		const hit = cache.get(arg)
		if (hit !== undefined || cache.has(arg)) return hit as R
		const value = fn(arg)
		cache.set(arg, value)
		return value
	}
}
// #endregion

// #region UTL-07 | deepClone
/**
 * Порядок проверок важен: примитивы → Date → Map → Set → Array → объект.
 * Array.isArray, а не typeof: массив тоже 'object'.
 * WeakMap seen решает циклы: копию кладём в карту СРАЗУ после создания,
 * до обхода содержимого, иначе рекурсия уйдёт в себя.
 *
 * Штатные варианты и их границы:
 *   structuredClone  — умеет Date, Map, Set, циклы; не умеет функции и DOM-узлы,
 *                      теряет прототипы классов;
 *   JSON.parse(JSON.stringify(x)) — ломает Date в строку, выкидывает undefined и функции,
 *                      превращает NaN и Infinity в null, на циклах бросает.
 */
export const deepClone = <T>(value: T, seen = new WeakMap<object, unknown>()): T => {
	if (value === null || typeof value !== 'object') return value

	const source = value as unknown as object
	if (seen.has(source)) return seen.get(source) as T

	if (source instanceof Date) return new Date(source.getTime()) as unknown as T

	if (source instanceof Map) {
		const copy = new Map()
		seen.set(source, copy)
		source.forEach((mapValue, mapKey) => copy.set(deepClone(mapKey, seen), deepClone(mapValue, seen)))
		return copy as unknown as T
	}

	if (source instanceof Set) {
		const copy = new Set()
		seen.set(source, copy)
		source.forEach(item => copy.add(deepClone(item, seen)))
		return copy as unknown as T
	}

	if (Array.isArray(source)) {
		const copy: unknown[] = []
		seen.set(source, copy)
		source.forEach(item => copy.push(deepClone(item, seen)))
		return copy as unknown as T
	}

	const copy: Record<string, unknown> = {}
	seen.set(source, copy)
	for (const [key, item] of Object.entries(source)) copy[key] = deepClone(item, seen)
	return copy as T
}
// #endregion

// #region UTL-08 | deepEqual
/**
 * Object.is вместо === даёт правильные ответы про NaN и -0 бесплатно.
 * Сравнение числа ключей обязательно: без него { a: 1 } окажется равен { a: 1, b: 2 }.
 * Проверка Array.isArray на обеих сторонах отделяет [1] от { 0: 1 }.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
	if (Object.is(a, b)) return true
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
	if (Array.isArray(a) !== Array.isArray(b)) return false

	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
	}

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false

	return keysA.every(
		key =>
			Object.prototype.hasOwnProperty.call(b, key) &&
			deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
	)
}
// #endregion

// #region UTL-09 | deepMerge
/**
 * Рекурсия только по «обычным» объектам. Массивы и Date перетираются целиком:
 * иначе слияние настроек давало бы непредсказуемые гибриды массивов.
 * Спред на каждом уровне гарантирует, что входные объекты не мутируются.
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)

export const deepMerge = <T extends object>(target: T, source: object): T => {
	// Спред дженерика в Record требует явного приведения: компилятор не знает,
	// что у T только строковые ключи.
	const result: Record<string, unknown> = { ...(target as Record<string, unknown>) }

	for (const [key, sourceValue] of Object.entries(source)) {
		const targetValue = result[key]
		result[key] =
			isPlainObject(targetValue) && isPlainObject(sourceValue)
				? deepMerge(targetValue, sourceValue)
				: sourceValue
	}

	return result as T
}
// #endregion

// #region UTL-10 | get по пути
/**
 * Сначала приводим индексы к единому виду: 'a.b[0].c' → 'a.b.0.c', потом идём по ключам.
 * Опциональная цепочка обрывает обход на первом отсутствующем уровне.
 * Проверка именно на undefined, а не `|| fallback`: иначе 0, '' и false
 * будут подменяться запасным значением — классическая ошибка.
 */
export const parsePath = (path: string): string[] =>
	path
		.replace(/\[(\w+)\]/g, '.$1')
		.split('.')
		.filter(Boolean)

export const get = (obj: unknown, path: string, fallback?: unknown): unknown => {
	const value = parsePath(path).reduce<unknown>(
		(acc, key) => (acc === null || acc === undefined ? undefined : (acc as Record<string, unknown>)[key]),
		obj
	)
	return value === undefined ? fallback : value
}
// #endregion

// #region UTL-11 | set по пути
/**
 * Иммутабельная запись: копируем каждый уровень по пути, остальное переиспользуем.
 * Тип создаваемого уровня выбирается по СЛЕДУЮЩЕМУ ключу: цифра — массив, иначе объект.
 * Локальный any здесь честнее гимнастики с типами: узел может быть и массивом, и объектом.
 */
export const set = <T extends object>(obj: T, path: string, value: unknown): T => {
	const keys = parsePath(path)
	if (keys.length === 0) return obj

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const copyNode = (node: unknown, asArray: boolean): any => {
		if (Array.isArray(node)) return [...node]
		if (node !== null && typeof node === 'object') return { ...node }
		return asArray ? [] : {}
	}

	const result = copyNode(obj, false)
	let cursor = result

	for (let i = 0; i < keys.length - 1; i++) {
		const nextIsIndex = /^\d+$/.test(keys[i + 1])
		cursor[keys[i]] = copyNode(cursor[keys[i]], nextIsIndex)
		cursor = cursor[keys[i]]
	}

	cursor[keys[keys.length - 1]] = value
	return result as T
}
// #endregion

// #region UTL-12 | EventEmitter
/**
 * Map<событие, Set<обработчик>>: Set сам защищает от двойной подписки.
 *
 * emit идёт по КОПИИ набора. Если обходить живой Set (или массив с индексом),
 * обработчик, отписавший сам себя, сдвинет позиции — и следующий подписчик
 * будет молча пропущен. Это классический баг, который просят найти на собесе.
 * Побочный эффект копии: обработчик, отписанный ВО ВРЕМЯ emit, всё равно отработает
 * в текущем проходе. Ровно так ведёт себя EventEmitter в Node; DOM EventTarget,
 * наоборот, такого слушателя уже не вызовет. Стоит знать, что поведение тут разное.
 *
 * Для once храним связь «оригинал → обёртка», чтобы off по исходной ссылке работал.
 */
export type Handler = (...args: unknown[]) => void

export class EventEmitter {
	#listeners = new Map<string, Set<Handler>>()
	#wrappers = new Map<Handler, Handler>()

	on(event: string, handler: Handler): () => void {
		const set = this.#listeners.get(event) ?? new Set<Handler>()
		set.add(handler)
		this.#listeners.set(event, set)
		return () => this.off(event, handler)
	}

	once(event: string, handler: Handler): () => void {
		const wrapper: Handler = (...args) => {
			this.off(event, handler)
			handler(...args)
		}
		this.#wrappers.set(handler, wrapper)
		this.on(event, wrapper)
		return () => this.off(event, handler)
	}

	off(event: string, handler: Handler): void {
		const set = this.#listeners.get(event)
		if (!set) return

		set.delete(handler)
		const wrapper = this.#wrappers.get(handler)
		if (wrapper) {
			set.delete(wrapper)
			this.#wrappers.delete(handler)
		}
		if (set.size === 0) this.#listeners.delete(event)
	}

	emit(event: string, ...args: unknown[]): void {
		const set = this.#listeners.get(event)
		if (!set) return
		for (const handler of [...set]) handler(...args)
	}

	listenerCount(event: string): number {
		return this.#listeners.get(event)?.size ?? 0
	}
}
// #endregion

// #region UTL-13 | LRU-кэш
/**
 * Вся соль в том, что Map помнит порядок вставки, а keys().next() даёт самый старый ключ.
 * Обращение (get и повторный set) = delete + set, что переносит ключ в конец.
 * Отдельный список давности не нужен. Сложность всех операций — O(1).
 */
export class LRUCache<K, V> {
	#map = new Map<K, V>()

	constructor(public readonly capacity: number) {}

	get(key: K): V | undefined {
		if (!this.#map.has(key)) return undefined
		const value = this.#map.get(key) as V
		this.#map.delete(key)
		this.#map.set(key, value)
		return value
	}

	set(key: K, value: V): void {
		if (this.#map.has(key)) this.#map.delete(key)
		this.#map.set(key, value)

		if (this.#map.size > this.capacity) {
			const oldest = this.#map.keys().next().value as K
			this.#map.delete(oldest)
		}
	}

	has(key: K): boolean {
		return this.#map.has(key)
	}

	get size(): number {
		return this.#map.size
	}

	keys(): K[] {
		return [...this.#map.keys()]
	}
}
// #endregion

// #region UTL-14 | curry
/**
 * fn.length — объявленная арность функции. Копим аргументы в замыкании,
 * пока их не станет достаточно, и только тогда зовём оригинал.
 * Значения по умолчанию и rest в length не считаются — об этом стоит сказать вслух.
 */
export const curry = (fn: (...args: never[]) => unknown): ((...args: unknown[]) => unknown) => {
	const arity = fn.length

	const collect =
		(collected: unknown[]) =>
		(...args: unknown[]): unknown => {
			const next = [...collected, ...args]
			if (next.length >= arity) return (fn as (...a: unknown[]) => unknown)(...next)
			return collect(next)
		}

	return collect([])
}
// #endregion

// #region UTL-15 | pipe и compose
/** Разница только в направлении свёртки: reduce против reduceRight. */
export const pipe =
	(...fns: Array<(value: never) => unknown>) =>
	(value: unknown): unknown =>
		fns.reduce<unknown>((acc, fn) => (fn as (v: unknown) => unknown)(acc), value)

export const compose =
	(...fns: Array<(value: never) => unknown>) =>
	(value: unknown): unknown =>
		fns.reduceRight<unknown>((acc, fn) => (fn as (v: unknown) => unknown)(acc), value)
// #endregion

// #region UTL-16 | Свой bind
/**
 * bind возвращает НОВУЮ функцию с зафиксированным this и частично применёнными аргументами.
 * Настоящий bind ещё умеет работать с new (тогда привязанный this игнорируется) —
 * упомянуть об этом на собесе полезно, реализовывать обычно не просят.
 */
export const myBind =
	<T, A extends unknown[], R>(fn: (this: T, ...args: A) => R, context: T, ...bound: unknown[]) =>
	(...args: unknown[]): R =>
		(fn as unknown as (this: T, ...rest: unknown[]) => R).apply(context, [...bound, ...args])
// #endregion

// #region UTL-17 | Свой call и apply
/**
 * Приём: временно кладём функцию свойством в объект. Тогда обычный вызов
 * obj.fn() сам выставит this равным obj — это и есть правило «this по точке».
 * Symbol как ключ гарантирует, что мы не затрём существующее свойство.
 */
export const myCall = <R>(fn: (...args: unknown[]) => R, context: object, ...args: unknown[]): R => {
	const key = Symbol('myCall')
	const target = context as Record<symbol, unknown>

	target[key] = fn
	const result = (target[key] as (...rest: unknown[]) => R)(...args)
	delete target[key]

	return result
}
// #endregion

// #region UTL-18 | classNames
/**
 * Рекурсивный обход: строки и числа берём как есть, массивы разворачиваем,
 * у объекта берём ключи с истинными значениями.
 * Это упрощённая версия библиотеки classnames — её просят написать на собесах в React-командах.
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, unknown>

export const cx = (...values: ClassValue[]): string => {
	const out: string[] = []

	const walk = (value: ClassValue): void => {
		if (!value) return
		if (typeof value === 'string' || typeof value === 'number') {
			out.push(String(value))
			return
		}
		if (Array.isArray(value)) {
			value.forEach(walk)
			return
		}
		for (const [key, flag] of Object.entries(value)) if (flag) out.push(key)
	}

	values.forEach(walk)
	return out.join(' ')
}
// #endregion

// #region UTL-19 | Свой instanceof
/**
 * instanceof не смотрит на конструктор — он ищет constructor.prototype
 * в ЦЕПОЧКЕ ПРОТОТИПОВ объекта. Поэтому подмена прототипа меняет ответ,
 * а примитивы всегда дают false: у них нет собственной цепочки.
 */
export const myInstanceOf = (value: unknown, constructor: Function): boolean => {
	if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false

	const target = constructor.prototype
	let proto = Object.getPrototypeOf(value)

	while (proto !== null) {
		if (proto === target) return true
		proto = Object.getPrototypeOf(proto)
	}
	return false
}
// #endregion

// #region UTL-20 | Глубокая заморозка
/**
 * Object.freeze поверхностный: запрещает менять сами свойства, но не то,
 * что лежит внутри вложенных объектов. WeakSet защищает от зацикливания.
 * Заморозка не делает объект иммутабельным «по-настоящему»: Map и Set
 * продолжают принимать изменения через свои методы.
 */
export const deepFreeze = <T>(value: T, seen = new WeakSet<object>()): T => {
	if (value === null || typeof value !== 'object') return value

	const source = value as unknown as object
	if (seen.has(source)) return value
	seen.add(source)
	Object.freeze(source)

	for (const key of Object.getOwnPropertyNames(source)) {
		deepFreeze((source as Record<string, unknown>)[key], seen)
	}
	return value
}
// #endregion

// #region UTL-21 | Счётчик вызовов в окне
/**
 * Скользящее окно: храним отметки времени, на каждом вызове выкидываем протухшие.
 * Проще, чем фиксированное окно, и без эффекта «двойной лимит на стыке окон».
 */
export const rateLimiter = (limit: number, windowMs: number): (() => boolean) => {
	const hits: number[] = []

	return () => {
		const now = Date.now()
		while (hits.length > 0 && now - hits[0] >= windowMs) hits.shift()
		if (hits.length >= limit) return false
		hits.push(now)
		return true
	}
}
// #endregion

// #region UTL-22 | Наблюдаемое значение
/**
 * Ядро любого стейт-менеджера: значение, набор подписчиков, уведомление при изменении.
 * Object.is отсекает лишние уведомления. Обход по копии набора —
 * чтобы отписка внутри слушателя не сбила итерацию.
 */
export type Store<T> = {
	get: () => T
	set: (next: T) => void
	subscribe: (listener: (value: T) => void) => () => void
}

export const createStore = <T>(initial: T): Store<T> => {
	let value = initial
	const listeners = new Set<(value: T) => void>()

	return {
		get: () => value,
		set: (next: T) => {
			if (Object.is(next, value)) return
			value = next
			for (const listener of [...listeners]) listener(value)
		},
		subscribe: listener => {
			listeners.add(listener)
			return () => {
				listeners.delete(listener)
			}
		},
	}
}
// #endregion

// #region UTL-23 | Группировка с глубоким ключом
/** Переиспользуем get из UTL-10: хороший ответ на собесе — «я уже написал эту функцию выше». */
export const groupByPath = <T extends object>(list: T[], path: string): Record<string, T[]> =>
	list.reduce<Record<string, T[]>>((acc, item) => {
		const raw = get(item, path)
		const key = raw === undefined || raw === null ? 'unknown' : String(raw)
		;(acc[key] ??= []).push(item)
		return acc
	}, Object.create(null))
// #endregion

// #region UTL-24 | Плоский объект
/**
 * Рекурсивный обход с накоплением префикса. Пустые объекты и массивы кладём как есть,
 * иначе они бы просто исчезли из результата.
 * Практика: отправка вложенной формы в API, которое принимает плоские поля.
 */
export const flattenObject = (obj: object): Record<string, unknown> => {
	const out: Record<string, unknown> = {}

	const walk = (value: unknown, prefix: string): void => {
		if (Array.isArray(value)) {
			if (value.length === 0) {
				if (prefix) out[prefix] = value
				return
			}
			value.forEach((item, index) => walk(item, `${prefix}[${index}]`))
			return
		}

		if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
			const entries = Object.entries(value)
			if (entries.length === 0) {
				if (prefix) out[prefix] = value
				return
			}
			for (const [key, item] of entries) walk(item, prefix ? `${prefix}.${key}` : key)
			return
		}

		out[prefix] = value
	}

	walk(obj, '')
	return out
}
// #endregion
