/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 12. Открывать только после своей попытки.
 */

export type Product = {
	id: number
	title: string
	category: string
	price: number
	rating: number
	inStock: boolean
	tags?: string[]
}

export type SortDirection = 'asc' | 'desc'

/**
 * Универсальное сравнение двух значений неизвестного типа.
 * Числа — вычитанием, строки — localeCompare с русской локалью:
 * обычное `>` поставит 'Ёлка' после 'Яблоко', потому что сравнивает коды символов.
 */
const compareValues = (a: unknown, b: unknown): number => {
	if (typeof a === 'number' && typeof b === 'number') return a - b
	if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
	return String(a ?? '').localeCompare(String(b ?? ''), 'ru')
}

const asText = (value: unknown): string => (value === null || value === undefined ? '' : String(value))

// #region DAT-01 | Фильтр каталога
/**
 * Каждое условие проверяется только если оно задано — отсюда `!== undefined`.
 * Проверять через `if (filter.minPrice)` нельзя: ноль — валидное значение,
 * и такой фильтр молча перестанет работать.
 */
export type ProductFilter = {
	category?: string
	minPrice?: number
	maxPrice?: number
	onlyInStock?: boolean
	minRating?: number
}

export const filterProducts = (items: Product[], filter: ProductFilter): Product[] =>
	items.filter(item => {
		if (filter.category !== undefined && item.category !== filter.category) return false
		if (filter.minPrice !== undefined && item.price < filter.minPrice) return false
		if (filter.maxPrice !== undefined && item.price > filter.maxPrice) return false
		if (filter.minRating !== undefined && item.rating < filter.minRating) return false
		if (filter.onlyInStock === true && !item.inStock) return false
		return true
	})
// #endregion

// #region DAT-02 | Поиск по нескольким полям
/**
 * Запрос нормализуется ОДИН раз до цикла, а не на каждом элементе.
 * asText вместо String(): String(undefined) даёт 'undefined', и запрос 'und'
 * начал бы находить товары без описания.
 */
export const searchInFields = <T extends object>(items: T[], query: string, fields: Array<keyof T>): T[] => {
	const needle = query.trim().toLowerCase()
	if (needle === '') return [...items]

	return items.filter(item => fields.some(field => asText(item[field]).toLowerCase().includes(needle)))
}
// #endregion

// #region DAT-03 | Сортировка по полю
/** Копия перед sort обязательна: sort сортирует на месте и испортил бы данные стора. */
export const sortByField = <T extends object>(items: T[], key: keyof T, direction: SortDirection = 'asc'): T[] => {
	const sign = direction === 'asc' ? 1 : -1
	return [...items].sort((a, b) => sign * compareValues(a[key], b[key]))
}
// #endregion

// #region DAT-04 | Сортировка по нескольким полям
/**
 * Первое ненулевое сравнение и есть ответ — остальные правила не смотрим.
 * Это ровно то, что делает ORDER BY a, b в SQL.
 */
export const multiSort = <T extends object>(
	items: T[],
	rules: Array<{ key: keyof T; direction: SortDirection }>
): T[] =>
	[...items].sort((a, b) => {
		for (const rule of rules) {
			const result = compareValues(a[rule.key], b[rule.key]) * (rule.direction === 'asc' ? 1 : -1)
			if (result !== 0) return result
		}
		return 0
	})

export type SortRule<T> = { key: keyof T; direction: SortDirection }
// #endregion

// #region DAT-05 | Пагинация
/**
 * pages минимум 1: пустой список — это одна пустая страница, а не ноль страниц
 * (иначе интерфейс покажет «страница 1 из 0»).
 * Номер зажимается в диапазон — на странице 99 из 4 пользователь должен увидеть последнюю.
 */
export type Page<T> = { items: T[]; page: number; pages: number; total: number }

export const paginate = <T>(items: T[], page: number, perPage: number): Page<T> => {
	const total = items.length
	const size = Math.max(1, Math.floor(perPage))
	const pages = Math.max(1, Math.ceil(total / size))
	const current = Math.min(Math.max(1, Math.floor(page)), pages)
	const start = (current - 1) * size

	return { items: items.slice(start, start + size), page: current, pages, total }
}
// #endregion

// #region DAT-06 | Номера страниц с многоточием
/**
 * Сначала собираем обязательные номера в Set (первая, последняя, текущая и соседи),
 * потом одним проходом расставляем разрывы.
 * Разрыв ровно в один номер заменяется самим номером: показать «…» вместо одной страницы — глупо.
 */
export const pageNumbers = (current: number, pages: number): Array<number | null> => {
	if (pages < 1) return []

	const wanted = new Set<number>([1, pages])
	for (const candidate of [current - 1, current, current + 1]) {
		if (candidate >= 1 && candidate <= pages) wanted.add(candidate)
	}

	const sorted = [...wanted].sort((a, b) => a - b)
	const result: Array<number | null> = []

	for (let i = 0; i < sorted.length; i += 1) {
		if (i > 0) {
			const gap = sorted[i] - sorted[i - 1]
			if (gap === 2) result.push(sorted[i] - 1)
			else if (gap > 2) result.push(null)
		}
		result.push(sorted[i])
	}
	return result
}
// #endregion

// #region DAT-07 | Группировка в объект
/**
 * Object.create(null) вместо {}: ключом группы может оказаться 'constructor'
 * или '__proto__', и обычный литерал на этом сломается.
 */
export const groupByField = <T extends object>(items: T[], key: keyof T): Record<string, T[]> => {
	const result: Record<string, T[]> = Object.create(null)
	for (const item of items) {
		const group = asText(item[key])
		;(result[group] ??= []).push(item)
	}
	return result
}
// #endregion

// #region DAT-08 | Агрегаты по полю
/**
 * Один проход вместо четырёх отдельных reduce. На пустом списке — нули,
 * иначе min останется Infinity и уедет в интерфейс.
 */
export type Aggregate = { sum: number; avg: number; min: number; max: number; count: number }

export const aggregate = <T extends object>(items: T[], key: keyof T): Aggregate => {
	if (items.length === 0) return { sum: 0, avg: 0, min: 0, max: 0, count: 0 }

	let sum = 0
	let min = Infinity
	let max = -Infinity

	for (const item of items) {
		const value = Number(item[key]) || 0
		sum += value
		min = Math.min(min, value)
		max = Math.max(max, value)
	}
	return { sum, avg: sum / items.length, min, max, count: items.length }
}
// #endregion

// #region DAT-09 | Счётчик значений
export const countByField = <T extends object>(items: T[], key: keyof T): Record<string, number> => {
	const result: Record<string, number> = Object.create(null)
	for (const item of items) {
		const group = asText(item[key])
		result[group] = (result[group] ?? 0) + 1
	}
	return result
}
// #endregion

// #region DAT-10 | Распределение по диапазонам
/**
 * Границы попарно: [b0, b1), [b1, b2), …, [bn, ∞).
 * Верхняя граница не включается — иначе товар за 100 попадёт сразу в два диапазона.
 */
export type Bucket = { from: number; to: number | null; count: number }

export const priceBuckets = (items: Product[], bounds: number[]): Bucket[] => {
	const buckets: Bucket[] = bounds.map((from, index) => ({
		from,
		to: index < bounds.length - 1 ? bounds[index + 1] : null,
		count: 0,
	}))

	for (const item of items) {
		for (const bucket of buckets) {
			if (item.price >= bucket.from && (bucket.to === null || item.price < bucket.to)) {
				bucket.count += 1
				break
			}
		}
	}
	return buckets
}
// #endregion

// #region DAT-11 | Соединение по ключу
/**
 * Индекс по правому списку строится один раз — O(n + m).
 * Вариант right.find(...) внутри map даёт O(n·m): на двух списках по 1000 элементов
 * это миллион сравнений вместо двух тысяч.
 */
export const leftJoin = <L extends object, R extends object, K extends string>(
	left: L[],
	right: R[],
	leftKey: keyof L,
	rightKey: keyof R,
	as: K
): Array<L & Record<K, R | null>> => {
	const index = new Map<unknown, R>()
	for (const item of right) index.set(item[rightKey], item)

	return left.map(item => ({ ...item, [as]: index.get(item[leftKey]) ?? null }) as L & Record<K, R | null>)
}
// #endregion

// #region DAT-12 | Нормализация
/**
 * Так данные держат в Redux и подобных сторах: обновление одного элемента
 * не трогает остальные, а порядок живёт отдельно в allIds.
 */
export type Normalized<T> = { byId: Record<string, T>; allIds: number[] }

export const normalize = <T extends { id: number }>(items: T[]): Normalized<T> => {
	const byId: Record<string, T> = Object.create(null)
	const allIds: number[] = []

	for (const item of items) {
		byId[String(item.id)] = item
		if (!allIds.includes(item.id)) allIds.push(item.id)
	}
	return { byId, allIds }
}
// #endregion

// #region DAT-13 | Денормализация
/**
 * Фильтр с предикатом-типом: без него TypeScript оставит в типе undefined,
 * хотя мы его уже отсеяли.
 */
export const denormalize = <T extends { id: number }>(source: Normalized<T>): T[] =>
	source.allIds.map(id => source.byId[String(id)]).filter((item): item is T => item !== undefined)
// #endregion

// #region DAT-14 | Разница двух списков
/**
 * Два Map и один проход по каждому списку — O(n + m).
 * Сравнение поверхностное: сначала число ключей, потом значения. Для вложенных
 * объектов нужен deepEqual, и об этом ограничении надо сказать вслух.
 */
export type Diff<T> = { added: T[]; removed: T[]; updated: T[] }

const shallowEqual = (a: object, b: object): boolean => {
	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false

	return keysA.every(
		key => (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key]
	)
}

export const diffById = <T extends { id: number }>(previous: T[], next: T[]): Diff<T> => {
	const before = new Map(previous.map(item => [item.id, item]))
	const after = new Map(next.map(item => [item.id, item]))

	const added = next.filter(item => !before.has(item.id))
	const removed = previous.filter(item => !after.has(item.id))
	const updated = next.filter(item => {
		const old = before.get(item.id)
		return old !== undefined && !shallowEqual(old, item)
	})

	return { added, removed, updated }
}
// #endregion

// #region DAT-15 | Вставить или обновить
/**
 * findIndex + map сохраняет позицию элемента: замена «на месте» не должна
 * переставлять строку таблицы в конец.
 */
export const upsertById = <T extends { id: number }>(items: T[], item: T): T[] => {
	const index = items.findIndex(current => current.id === item.id)
	if (index === -1) return [...items, item]

	const result = [...items]
	result[index] = item
	return result
}
// #endregion

// #region DAT-16 | Оставить только нужные поля
/** Ключи, которых в объекте нет, не добавляются — иначе в CSV поедут пустые колонки. */
export const selectFields = <T extends object, K extends keyof T>(items: T[], keys: K[]): Array<Pick<T, K>> =>
	items.map(item => {
		const result = {} as Pick<T, K>
		for (const key of keys) {
			if (key in item) result[key] = item[key]
		}
		return result
	})
// #endregion

// #region DAT-17 | Переименовать поля
/** Проходим по карте, а не по объекту: так в результат попадает только описанное. */
export const renameFields = (
	items: Array<Record<string, unknown>>,
	map: Record<string, string>
): Array<Record<string, unknown>> =>
	items.map(item => {
		const result: Record<string, unknown> = {}
		for (const [from, to] of Object.entries(map)) {
			if (from in item) result[to] = item[from]
		}
		return result
	})
// #endregion

// #region DAT-18 | Лучший в каждой группе
/**
 * Map сохраняет порядок первого появления группы, поэтому результат стабилен.
 * Строгое `>` вместо `>=` — при равенстве побеждает первый встреченный.
 */
export const topByGroup = <T extends object>(items: T[], groupKey: keyof T, valueKey: keyof T): T[] => {
	const best = new Map<string, T>()

	for (const item of items) {
		const group = asText(item[groupKey])
		const current = best.get(group)
		if (current === undefined || Number(item[valueKey]) > Number(current[valueKey])) best.set(group, item)
	}
	return [...best.values()]
}
// #endregion

// #region DAT-19 | Скользящее среднее
/**
 * Начало ряда усредняется по неполному окну — иначе график начнётся с дырки.
 * На длинных рядах правильнее держать бегущую сумму, здесь окна короткие.
 */
export const movingAverage = (values: number[], window: number): number[] => {
	if (window <= 1) return [...values]

	return values.map((_, index) => {
		const slice = values.slice(Math.max(0, index - window + 1), index + 1)
		return slice.reduce((sum, value) => sum + value, 0) / slice.length
	})
}
// #endregion

// #region DAT-20 | Заполнить пропуски дат
/**
 * Дата двигается в UTC: new Date('2026-03-01') парсится как полночь UTC,
 * а прибавление суток в местном времени сломается на переводе часов.
 * Значения кладутся в Map по дате — поиск по массиву внутри цикла был бы O(n·m).
 */
export type Point = { date: string; value: number }

export const fillDateGaps = (points: Point[], from: string, to: string): Point[] => {
	const byDate = new Map(points.map(point => [point.date, point.value]))
	const result: Point[] = []

	const DAY = 86_400_000
	const end = Date.parse(to)
	for (let time = Date.parse(from); time <= end; time += DAY) {
		const date = new Date(time).toISOString().slice(0, 10)
		result.push({ date, value: byDate.get(date) ?? 0 })
	}
	return result
}
// #endregion

// #region DAT-21 | Итоговая строка
/**
 * Поле считается числовым, только если числовое у ВСЕХ строк.
 * Пустой список — прочерки: сумма нуля строк это не ноль, а «нечего показывать».
 */
export const summaryRow = <T extends object>(
	items: T[],
	keys: Array<keyof T>
): Record<string, number | string> => {
	const result: Record<string, number | string> = {}

	for (const key of keys) {
		const numeric = items.length > 0 && items.every(item => typeof item[key] === 'number')
		result[String(key)] = numeric
			? items.reduce((sum, item) => sum + (item[key] as number), 0)
			: '—'
	}
	return result
}
// #endregion

// #region DAT-22 | Закреплённые наверху
/**
 * Закреплённые берутся в порядке pinnedIds, остальные сортируются обычным образом.
 * Set для проверки «закреплён ли» — иначе includes внутри filter даёт O(n·k).
 */
export const sortWithPinned = <T extends { id: number }>(
	items: T[],
	pinnedIds: number[],
	key: keyof T,
	direction: SortDirection = 'asc'
): T[] => {
	const pinnedSet = new Set(pinnedIds)
	const byId = new Map(items.map(item => [item.id, item]))

	const pinned = pinnedIds
		.map(id => byId.get(id))
		.filter((item): item is T => item !== undefined)
	const rest = sortByField(
		items.filter(item => !pinnedSet.has(item.id)),
		key,
		direction
	)

	return [...pinned, ...rest]
}
// #endregion

// #region DAT-23 | Переключение сортировки
/** Третий клик по тому же полю сбрасывает сортировку — пользователь должен уметь вернуть исходный порядок. */
export type SortState = { key: string; direction: SortDirection } | null

export const toggleSort = (state: SortState, key: string): SortState => {
	if (state === null || state.key !== key) return { key, direction: 'asc' }
	if (state.direction === 'asc') return { key, direction: 'desc' }
	return null
}
// #endregion

// #region DAT-24 | Комбинатор фильтров
/**
 * every ленив: на первом false остальные предикаты не вызываются.
 * Пустой список даёт true — поэтому «фильтры не выбраны» сразу работает правильно.
 */
export const combineFilters =
	<T>(predicates: Array<(item: T) => boolean>): ((item: T) => boolean) =>
	item =>
		predicates.every(predicate => predicate(item))
// #endregion
