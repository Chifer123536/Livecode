/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 02. Открывать только после своей попытки.
 */

// #region ARR-01 | Удвоить каждое
/** map всегда возвращает массив ТОЙ ЖЕ длины. Если нужна другая длина — это filter или reduce. */
export const doubleAll = (nums: number[]): number[] => nums.map(n => n * 2)
// #endregion

// #region ARR-02 | Только чётные
/** filter создаёт новый массив, исходный не трогает. Это и есть «иммутабельно». */
export const onlyEven = (nums: number[]): number[] => nums.filter(n => n % 2 === 0)
// #endregion

// #region ARR-03 | Сумма
/** Начальное значение 0 обязательно: reduce без него на пустом массиве бросит TypeError. */
export const total = (nums: number[]): number => nums.reduce((acc, n) => acc + n, 0)
// #endregion

// #region ARR-04 | Элемент с максимальным полем
/**
 * Строгое > оставляет ПЕРВЫЙ из равных. Поставишь >= — победит последний,
 * и это меняет поведение в задачах вида «первый самый дорогой товар».
 */
export const maxBy = <T>(list: T[], pick: (item: T) => number): T | null =>
	list.reduce<T | null>((best, item) => (best === null || pick(item) > pick(best) ? item : best), null)
// #endregion

// #region ARR-05 | Сколько раз встречается
/** filter().length читается лучше, чем reduce со счётчиком. Оба O(n). */
export const countOf = <T>(list: T[], value: T): number => list.filter(item => item === value).length
// #endregion

// #region ARR-06 | Последние N
/**
 * Главная ловушка: slice(-0) === slice(0) вернёт ВЕСЬ массив, потому что -0 === 0.
 * Поэтому нужен явный ранний выход на n <= 0.
 */
export const lastN = <T>(list: T[], n: number): T[] => (n <= 0 ? [] : list.slice(-n))
// #endregion

// #region ARR-07 | Выкинуть пустое
/** filter(Boolean) отсекает 0, '', null, undefined, NaN, false. Перечисли их вслух — это вопрос. */
export const compact = <T>(list: T[]): T[] => list.filter(Boolean)
// #endregion

// #region ARR-08 | Уникальные значения
/** Set сохраняет порядок вставки и сравнивает по SameValueZero: NaN считается равным NaN. */
export const unique = <T>(list: T[]): T[] => [...new Set(list)]
// #endregion

// #region ARR-09 | Уникальные по ключу
/** Set ключей + filter за один проход. has/add — O(1), итого O(n). */
export const uniqueBy = <T>(list: T[], keyOf: (item: T) => unknown): T[] => {
	const seen = new Set<unknown>()
	return list.filter(item => {
		const key = keyOf(item)
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}
// #endregion

// #region ARR-10 | Разбить на куски
/** Длину считаем заранее, каждый кусок — slice. size <= 0 зациклил бы while-вариант. */
export const chunk = <T>(list: T[], size: number): T[][] => {
	if (size <= 0) return []
	return Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size))
}
// #endregion

// #region ARR-11 | Выпрямить вложенность
/**
 * Рекурсия через reduce. Штатно — list.flat(Infinity).
 * На вложенности в десятки тысяч уровней рекурсия положит стек, тогда нужен явный стек и while.
 */
export const flattenDeep = (list: unknown[]): unknown[] =>
	list.reduce<unknown[]>((acc, item) => acc.concat(Array.isArray(item) ? flattenDeep(item) : item), [])
// #endregion

// #region ARR-12 | Попарно склеить
/** Обрезаем по короткому, иначе во второй половине пар будет undefined. */
export const zip = <A, B>(a: A[], b: B[]): Array<[A, B]> =>
	a.slice(0, Math.min(a.length, b.length)).map((item, i) => [item, b[i]])
// #endregion

// #region ARR-13 | Два массива в объект
/** Object.fromEntries — обратная операция к Object.entries, появилась в ES2019. */
export const zipObject = <V>(keys: string[], values: V[]): Record<string, V> =>
	Object.fromEntries(keys.map((key, i) => [key, values[i]]))
// #endregion

// #region ARR-14 | Пересечение
/**
 * Set по второму массиву даёт O(n + m). Наивный a.filter(x => b.includes(x)) — это O(n * m),
 * и именно этот вопрос задаст интервьюер.
 */
export const intersect = <T>(a: T[], b: T[]): T[] => {
	const inB = new Set(b)
	return [...new Set(a.filter(item => inB.has(item)))]
}
// #endregion

// #region ARR-15 | Разность
/** Тот же приём с Set, только условие инвертировано. */
export const difference = <T>(a: T[], b: T[]): T[] => {
	const inB = new Set(b)
	return a.filter(item => !inB.has(item))
}
// #endregion

// #region ARR-16 | Разделить надвое
/** Два filter — два прохода. reduce с парой аккумуляторов — один. На собесе назови оба варианта. */
export const partition = <T>(list: T[], predicate: (item: T) => boolean): [T[], T[]] =>
	list.reduce<[T[], T[]]>(
		(acc, item) => {
			acc[predicate(item) ? 0 : 1].push(item)
			return acc
		},
		[[], []]
	)
// #endregion

// #region ARR-17 | Группировка
/**
 * (acc[key] ??= []).push(item) — короткая форма «создай массив, если его нет».
 * Object.create(null) вместо {} защищает от ключей '__proto__' и 'constructor'.
 * Штатно с ES2024 есть Object.groupBy — упомяни, но уметь написать руками обязан.
 */
export const groupBy = <T>(list: T[], keyOf: (item: T) => string): Record<string, T[]> =>
	list.reduce<Record<string, T[]>>((acc, item) => {
		const key = keyOf(item)
		;(acc[key] ??= []).push(item)
		return acc
	}, Object.create(null))
// #endregion

// #region ARR-18 | Подсчёт по ключу
/** ?? 0, а не || 0: с нулём они ведут себя одинаково, но ?? точнее выражает намерение. */
export const countBy = <T>(list: T[], keyOf: (item: T) => string): Record<string, number> =>
	list.reduce<Record<string, number>>((acc, item) => {
		const key = keyOf(item)
		acc[key] = (acc[key] ?? 0) + 1
		return acc
	}, Object.create(null))
// #endregion

// #region ARR-19 | Сортировка по ключу
/**
 * [...list] обязателен: sort мутирует. С ES2023 есть list.toSorted() — сразу копия.
 * Дефолтный sort приводит к строке, поэтому [9, 10, 100] превратился бы в [10, 100, 9].
 */
export const sortBy = <T>(list: T[], keyOf: (item: T) => number | string): T[] =>
	[...list].sort((a, b) => {
		const av = keyOf(a)
		const bv = keyOf(b)
		if (typeof av === 'number' && typeof bv === 'number') return av - bv
		return String(av).localeCompare(String(bv))
	})
// #endregion

// #region ARR-20 | Сортировка по нескольким полям
/**
 * Идём по правилам, первое ненулевое сравнение и решает. Направление — просто смена знака.
 * sort в V8 стабильная с 2018 года, поэтому равные элементы сохраняют исходный порядок.
 */
export type SortRule<T> = { key: keyof T; dir: 'asc' | 'desc' }
export const sortByMany = <T extends Record<string, string | number>>(list: T[], rules: Array<SortRule<T>>): T[] =>
	[...list].sort((a, b) => {
		for (const { key, dir } of rules) {
			const av = a[key]
			const bv = b[key]
			const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
			if (cmp !== 0) return dir === 'desc' ? -cmp : cmp
		}
		return 0
	})
// #endregion

// #region ARR-21 | Индекс максимума
/** Четвёртый аргумент reduce — сам массив, через него сравниваем с текущим лидером. */
export const indexOfMax = (nums: number[]): number =>
	nums.length === 0 ? -1 : nums.reduce((best, n, i, arr) => (n > arr[best] ? i : best), 0)
// #endregion

// #region ARR-22 | Сумма по полю
/** Тот же reduce, что и в total, но значение достаётся через колбэк. */
export const sumBy = <T>(list: T[], pick: (item: T) => number): number =>
	list.reduce((acc, item) => acc + pick(item), 0)
// #endregion

// #region ARR-23 | Вставить по индексу
/** Спред двух slice — самый читаемый иммутабельный вставщик. Индекс зажимаем, чтобы не ловить дыры. */
export const insertAt = <T>(list: T[], index: number, item: T): T[] => {
	const at = Math.min(Math.max(0, index), list.length)
	return [...list.slice(0, at), item, ...list.slice(at)]
}
// #endregion

// #region ARR-24 | Удалить по индексу
/**
 * filter по индексу читается лучше, чем slice+slice, и сам игнорирует несуществующий индекс.
 * Удалять по значению (filter(x => x !== item)) нельзя: выкинет все дубликаты.
 */
export const removeAt = <T>(list: T[], index: number): T[] => list.filter((_, i) => i !== index)
// #endregion

// #region ARR-25 | Заменить по индексу
/** Ровно этот приём живёт в каждом React-редьюсере: map с проверкой индекса. */
export const replaceAt = <T>(list: T[], index: number, item: T): T[] =>
	list.map((current, i) => (i === index ? item : current))
// #endregion

// #region ARR-26 | Переключить элемент
/** includes + тернарник. Для объектов это сравнение по ссылке — стоит сказать вслух. */
export const toggleItem = <T>(list: T[], item: T): T[] =>
	list.includes(item) ? list.filter(current => current !== item) : [...list, item]
// #endregion

// #region ARR-27 | Переставить элемент
/**
 * splice по КОПИИ: вырезали, вставили. Вход не пострадал.
 * Тонкость: после вырезания индексы справа сдвигаются влево, но так как мы вставляем
 * в уже укороченный массив, дополнительная коррекция to не нужна.
 */
export const moveItem = <T>(list: T[], from: number, to: number): T[] => {
	const copy = [...list]
	const [item] = copy.splice(from, 1)
	if (item === undefined) return copy
	copy.splice(to, 0, item)
	return copy
}
// #endregion

// #region ARR-28 | Циклический сдвиг
/** ((n % len) + len) % len — стандартный приём получить неотрицательный остаток. */
export const rotate = <T>(list: T[], n: number): T[] => {
	if (list.length === 0) return []
	const shift = ((n % list.length) + list.length) % list.length
	return [...list.slice(shift), ...list.slice(0, shift)]
}
// #endregion

// #region ARR-29 | Скользящее окно
/** Количество окон = length - size + 1. Если size больше длины, число отрицательное — значит окон нет. */
export const windowed = <T>(list: T[], size: number): T[][] => {
	if (size <= 0 || size > list.length) return []
	return Array.from({ length: list.length - size + 1 }, (_, i) => list.slice(i, i + size))
}
// #endregion

// #region ARR-30 | Собрать все теги
/** flatMap = map + flat(1) за один проход. Дальше Set на уникальность и сортировка по копии. */
export const allTags = (posts: Array<{ tags: string[] }>): string[] =>
	[...new Set(posts.flatMap(post => post.tags))].sort((a, b) => a.localeCompare(b))
// #endregion

// #region ARR-31 | Разложить по колонкам
/**
 * base — сколько достанется каждой колонке, rest — сколько колонок получат на один элемент больше.
 * Наивное chunk(list, ceil(len/cols)) даёт другую раскладку и оставляет последнюю колонку пустой.
 */
export const toColumns = <T>(list: T[], columns: number): T[][] => {
	if (columns <= 0) return []
	const base = Math.floor(list.length / columns)
	let rest = list.length % columns
	const out: T[][] = []
	let cursor = 0
	for (let col = 0; col < columns; col++) {
		const size = base + (rest > 0 ? 1 : 0)
		if (rest > 0) rest--
		out.push(list.slice(cursor, cursor + size))
		cursor += size
	}
	return out
}
// #endregion

// #region ARR-32 | Схлопнуть подряд идущие дубли
/** Сравниваем с предыдущим элементом по индексу. Первый элемент проходит всегда. */
export const dedupeConsecutive = <T>(list: T[]): T[] => list.filter((item, i) => i === 0 || item !== list[i - 1])
// #endregion
