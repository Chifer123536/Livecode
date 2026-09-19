/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 04. Открывать только после своей попытки.
 */

// #region OBJ-01 | Взять ключи
/** Фильтруем сами ключи, а не entries: так несуществующий ключ отсеивается сам. */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Partial<T> =>
	keys.reduce<Partial<T>>((acc, key) => {
		if (key in obj) acc[key] = obj[key]
		return acc
	}, {})
// #endregion

// #region OBJ-02 | Убрать ключи
/**
 * Через entries + filter + fromEntries — самый читаемый вариант.
 * Вариант «скопировать и delete» тоже рабочий, но delete сбрасывает скрытый класс
 * объекта в движке и на горячем коде заметно медленнее.
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Partial<T> =>
	Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Partial<T>
// #endregion

// #region OBJ-03 | Поменять ключи и значения
/** Дубли значений схлопываются: последний перетирает предыдущие. Это потеря данных. */
export const invert = (obj: Record<string, string>): Record<string, string> =>
	Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]))
// #endregion

// #region OBJ-04 | Преобразовать значения
/** Ключ вторым аргументом — мелочь, но избавляет от второго прохода по объекту. */
export const mapValues = <V, R>(obj: Record<string, V>, fn: (value: V, key: string) => R): Record<string, R> =>
	Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]))
// #endregion

// #region OBJ-05 | Преобразовать ключи
/** Если преобразование даст одинаковые ключи, они схлопнутся — предупреди об этом вслух. */
export const mapKeys = <V>(obj: Record<string, V>, fn: (key: string, value: V) => string): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).map(([key, value]) => [fn(key, value), value]))
// #endregion

// #region OBJ-06 | Отфильтровать по значению
export const pickBy = <V>(obj: Record<string, V>, predicate: (value: V, key: string) => boolean): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(value, key)))
// #endregion

// #region OBJ-07 | Выкинуть по значению
/** Зеркало pickBy: тот же код с инвертированным условием. */
export const omitBy = <V>(obj: Record<string, V>, predicate: (value: V, key: string) => boolean): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).filter(([key, value]) => !predicate(value, key)))
// #endregion

// #region OBJ-08 | Пустой ли объект
/**
 * Object.keys().length === 0. Проверка `obj === {}` всегда ложна: сравниваются ссылки.
 * JSON.stringify(obj) === '{}' тоже работает, но это лишняя сериализация.
 */
export const isEmpty = (obj: object): boolean => Object.keys(obj).length === 0
// #endregion

// #region OBJ-09 | Обычный ли это объект
/**
 * typeof null === 'object' — проверка на null обязательна.
 * Прототип обычного литерала — Object.prototype, у Object.create(null) прототипа нет.
 * У массива, Date и экземпляра класса прототип другой, поэтому они отсеиваются.
 */
export const isPlainObject = (value: unknown): boolean => {
	if (typeof value !== 'object' || value === null) return false
	const proto = Object.getPrototypeOf(value)
	return proto === Object.prototype || proto === null
}
// #endregion

// #region OBJ-10 | Значения по умолчанию
/**
 * Простой спред { ...defaults, ...obj } НЕ подходит: явный undefined в obj
 * перетрёт дефолт. Поэтому проходим по ключам и подставляем дефолт
 * только там, где значение undefined.
 */
export const withDefaults = <T extends object>(obj: Partial<T>, defaults: T): T => {
	const result = { ...defaults } as T
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) (result as Record<string, unknown>)[key] = value
	}
	return result
}
// #endregion

// #region OBJ-11 | Список в словарь по id
export const indexById = <T extends { id: string }>(list: T[]): Record<string, T> =>
	Object.fromEntries(list.map(item => [item.id, item]))
// #endregion

// #region OBJ-12 | Нормализация
/**
 * Плоское хранилище вместо вложенных массивов: обновление одной сущности
 * не заставляет пересоздавать весь список, а поиск по id стоит O(1).
 * allIds хранит порядок, byId — сами данные.
 */
export type Normalized<T> = { byId: Record<string, T>; allIds: string[] }

export const normalize = <T extends { id: string }>(list: T[]): Normalized<T> => ({
	byId: Object.fromEntries(list.map(item => [item.id, item])),
	allIds: list.map(item => item.id),
})
// #endregion

// #region OBJ-13 | Обратно в список
/** filter(Boolean) отсекает идентификаторы, для которых записи уже нет. */
export const denormalize = <T>(data: Normalized<T>): T[] =>
	data.allIds.map(id => data.byId[id]).filter((item): item is T => item !== undefined)
// #endregion

// #region OBJ-14 | Переименовать ключи
/** ?? key оставляет исходное имя, если в карте его нет. */
export const renameKeys = <V>(obj: Record<string, V>, map: Record<string, string>): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).map(([key, value]) => [map[key] ?? key, value]))
// #endregion

// #region OBJ-15 | Убрать пустые значения
/**
 * value != null — двойное равенство здесь уместно и ловит сразу null и undefined.
 * Это один из немногих случаев, когда != лучше !==.
 */
export const removeEmpty = <V>(obj: Record<string, V>): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).filter(([, value]) => value != null && value !== ''))
// #endregion

// #region OBJ-16 | Объект в query-строку
/**
 * Кодирование обязательно: кириллица и символы & = ? сломают строку запроса.
 * На проде берут URLSearchParams — он делает то же самое и умеет массивы через append.
 */
export const toQuery = (
	params: Record<string, string | number | boolean | null | undefined | string[]>
): string => {
	const parts: string[] = []

	for (const [key, value] of Object.entries(params)) {
		if (value == null) continue
		const values = Array.isArray(value) ? value : [value]
		for (const item of values) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
	}

	return parts.join('&')
}
// #endregion

// #region OBJ-17 | Query-строка в объект
/**
 * Повтор ключа превращается в массив. URLSearchParams сам так не умеет:
 * get вернёт первое значение, getAll — массив, и разницу надо помнить.
 */
export const parseQuery = (query: string): Record<string, string | string[]> => {
	const result: Record<string, string | string[]> = {}

	for (const pair of query.replace(/^\?/, '').split('&').filter(Boolean)) {
		const [rawKey, rawValue = ''] = pair.split('=')
		const key = decodeURIComponent(rawKey)
		const value = decodeURIComponent(rawValue)

		const existing = result[key]
		if (existing === undefined) result[key] = value
		else if (Array.isArray(existing)) existing.push(value)
		else result[key] = [existing, value]
	}

	return result
}
// #endregion

// #region OBJ-18 | Есть ли путь
/**
 * Проверяем именно НАЛИЧИЕ ключа через `in`, а не значение:
 * { a: { b: undefined } } содержит путь 'a.b', хотя значение undefined.
 */
export const hasPath = (obj: unknown, path: string): boolean => {
	let cursor: unknown = obj

	for (const key of path.split('.').filter(Boolean)) {
		if (typeof cursor !== 'object' || cursor === null) return false
		if (!(key in (cursor as object))) return false
		cursor = (cursor as Record<string, unknown>)[key]
	}
	return true
}
// #endregion

// #region OBJ-19 | Иммутабельное обновление по пути
/**
 * Копируем только узлы вдоль пути — «структурное разделение».
 * Ветки, которых изменение не коснулось, остаются теми же по ссылке,
 * поэтому React.memo на них не сработает и лишних перерисовок не будет.
 */
export const updateIn = <T extends object>(obj: T, path: string, updater: (value: unknown) => unknown): T => {
	const keys = path.split('.').filter(Boolean)
	if (keys.length === 0) return obj

	const [head, ...rest] = keys
	const source = obj as Record<string, unknown>
	const nextValue =
		rest.length === 0
			? updater(source[head])
			: updateIn((source[head] ?? {}) as object, rest.join('.'), updater)

	return { ...source, [head]: nextValue } as T
}
// #endregion

// #region OBJ-20 | Что изменилось
/** Object.is корректно обрабатывает NaN и -0, в отличие от ===. */
export const objectDiff = <T extends Record<string, unknown>>(prev: T, next: T): Partial<T> => {
	const result: Partial<T> = {}

	for (const key of Object.keys(next) as Array<keyof T>) {
		if (!Object.is(prev[key], next[key])) result[key] = next[key]
	}
	return result
}
// #endregion

// #region OBJ-21 | Все пути листьев
/**
 * Рекурсия с накоплением префикса. Массивы и Date считаем листьями —
 * иначе пути разрастаются до бесполезных 'list.0.id'.
 */
export const deepKeys = (obj: object): string[] => {
	const out: string[] = []

	const walk = (value: unknown, prefix: string): void => {
		const isBranch =
			typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)

		if (!isBranch) {
			if (prefix) out.push(prefix)
			return
		}

		const entries = Object.entries(value as object)
		if (entries.length === 0) {
			if (prefix) out.push(prefix)
			return
		}
		for (const [key, item] of entries) walk(item, prefix ? `${prefix}.${key}` : key)
	}

	walk(obj, '')
	return out
}
// #endregion

// #region OBJ-22 | Сумма значений
export const sumValues = (obj: Record<string, number>): number =>
	Object.values(obj).reduce((acc, value) => acc + value, 0)
// #endregion

// #region OBJ-23 | Ключ с максимальным значением
/** Строгое > оставляет первый из равных. С >= победил бы последний. */
export const maxKeyByValue = (obj: Record<string, number>): string | null => {
	const entries = Object.entries(obj)
	if (entries.length === 0) return null

	return entries.reduce((best, [key, value]) => (value > obj[best] ? key : best), entries[0][0])
}
// #endregion

// #region OBJ-24 | Отсортировать ключи
/**
 * Порядок ключей в объекте действительно соблюдается для строковых ключей.
 * Но целочисленные ключи всегда идут первыми по возрастанию — сортировка их не спасёт.
 */
export const sortKeys = <V>(obj: Record<string, V>): Record<string, V> =>
	Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))
// #endregion

// #region OBJ-25 | snake_case в camelCase рекурсивно
/**
 * Обход по трём веткам: массив → элементы, обычный объект → ключи, остальное → как есть.
 * Проверка на «обычный объект» обязательна, иначе Date развалится на пустой объект.
 */
const toCamel = (key: string): string => key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())

export const camelizeKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(camelizeKeys)

	if (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype) {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [toCamel(key), camelizeKeys(item)]))
	}

	return value
}
// #endregion

// #region OBJ-26 | Пары, отсортированные по значению
/** Второй критерий сортировки убирает недетерминированность при равных значениях. */
export const entriesByValueDesc = (obj: Record<string, number>): Array<[string, number]> =>
	Object.entries(obj).sort(([keyA, valueA], [keyB, valueB]) =>
		valueA === valueB ? keyA.localeCompare(keyB) : valueB - valueA
	)
// #endregion

// #region OBJ-27 | Объект и Map туда-обратно
/** Оба преобразования — одна строка, потому что Map принимает и отдаёт пары. */
export const toMap = <V>(obj: Record<string, V>): Map<string, V> => new Map(Object.entries(obj))
export const fromMap = <V>(map: Map<string, V>): Record<string, V> => Object.fromEntries(map)
// #endregion

// #region OBJ-28 | Поверхностное сравнение
/**
 * Сначала сравниваем количество ключей, потом значения через Object.is.
 * Вложенные объекты сравниваются ПО ССЫЛКЕ — именно поэтому новый объект
 * в пропсах ломает React.memo, даже если содержимое то же самое.
 */
export const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
	if (Object.is(a, b)) return true

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false

	return keysA.every(key => Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key]))
}
// #endregion
