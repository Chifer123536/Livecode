/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 13. Открывать только после своей попытки.
 */

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** Простой объект — тот, что стоит разбирать рекурсивно. Date, Map, File разбирать нельзя. */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype

// #region API-01 | Сборка query-строки
/**
 * URLSearchParams сам кодирует значения — руками encodeURIComponent писать не нужно.
 * Пропуск undefined и null обязателен: иначе в URL уедет строка 'undefined'
 * и бэкенд начнёт фильтровать по ней.
 */
export const buildQuery = (params: Record<string, unknown>): string => {
	const search = new URLSearchParams()

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item !== undefined && item !== null) search.append(key, String(item))
			}
			continue
		}
		search.append(key, String(value))
	}
	return search.toString()
}
// #endregion

// #region API-02 | Разбор query-строки
/**
 * getAll даёт все значения ключа, поэтому массив получается сам.
 * Ведущий '?' URLSearchParams умеет отбрасывать, но полагаться на это не стоит.
 */
export const parseQuery = (query: string): Record<string, string | string[]> => {
	const search = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
	const result: Record<string, string | string[]> = {}

	for (const key of new Set(search.keys())) {
		const values = search.getAll(key)
		result[key] = values.length > 1 ? values : values[0]
	}
	return result
}
// #endregion

// #region API-03 | Сборка URL
/** Срезаем слэш справа у базы и слева у пути — иначе получится '//users'. */
export const buildUrl = (base: string, path: string, params?: Record<string, unknown>): string => {
	const url = `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
	const query = params ? buildQuery(params) : ''
	return query ? `${url}?${query}` : url
}
// #endregion

// #region API-04 | snake_case в camelCase
/**
 * Рекурсия по массивам и ПРОСТЫМ объектам. Проверка прототипа важна:
 * без неё Date развалится на пустой объект, а File потеряет содержимое.
 */
const toCamel = (key: string): string => key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())

export const camelizeKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(camelizeKeys)
	if (!isPlainObject(value)) return value

	const result: Record<string, unknown> = {}
	for (const [key, item] of Object.entries(value)) result[toCamel(key)] = camelizeKeys(item)
	return result
}
// #endregion

// #region API-05 | camelCase в snake_case
const toSnake = (key: string): string => key.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`)

export const snakeizeKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(snakeizeKeys)
	if (!isPlainObject(value)) return value

	const result: Record<string, unknown> = {}
	for (const [key, item] of Object.entries(value)) result[toSnake(key)] = snakeizeKeys(item)
	return result
}
// #endregion

// #region API-06 | Ошибка с кодом
/**
 * Object.setPrototypeOf нужен, если код собирается в ES5: там наследование от Error
 * ломает цепочку прототипов и instanceof ApiError возвращает false.
 * name выставляем явно — иначе в логах будет просто 'Error'.
 */
export class ApiError extends Error {
	status: number
	data: unknown

	constructor(status: number, message: string, data?: unknown) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.data = data
		Object.setPrototypeOf(this, ApiError.prototype)
	}
}
// #endregion

// #region API-07 | Обёртка над fetch
/**
 * Три вещи, которые забывают:
 * 1) fetch не бросает на 404 и 500 — проверяем response.ok сами;
 * 2) тело ошибки тоже полезно, но оно может оказаться не JSON — читаем через try;
 * 3) 204 и пустое тело: response.json() на них бросит SyntaxError.
 * Сетевой сбой приводим к ApiError(0), чтобы наверху был один тип ошибки.
 */
export const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
	let response: Response
	try {
		response = await fetch(url, options)
	} catch (error) {
		throw new ApiError(0, error instanceof Error ? error.message : 'Сетевая ошибка')
	}

	if (!response.ok) {
		let data: unknown = null
		try {
			data = await response.json()
		} catch {
			data = null
		}
		throw new ApiError(response.status, `HTTP ${response.status}`, data)
	}

	if (response.status === 204) return null as T

	const text = await response.text()
	return (text ? JSON.parse(text) : null) as T
}
// #endregion

// #region API-08 | Таймаут через AbortController
/**
 * clearTimeout в finally — иначе таймер живёт до срабатывания и держит процесс.
 * Внешний signal подписывается на abort и пробрасывает отмену внутрь:
 * так работают и таймаут, и ручная отмена одновременно.
 */
export const fetchWithTimeout = async (url: string, ms: number, options?: RequestInit): Promise<Response> => {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(new Error('Таймаут')), ms)

	const external = options?.signal
	const forward = () => controller.abort(external?.reason)
	if (external) {
		if (external.aborted) forward()
		else external.addEventListener('abort', forward, { once: true })
	}

	try {
		return await fetch(url, { ...options, signal: controller.signal })
	} finally {
		clearTimeout(timer)
		external?.removeEventListener('abort', forward)
	}
}
// #endregion

// #region API-09 | Какие ошибки повторять
/**
 * 429 и 5xx — состояние сервера, оно меняется само. 4xx — состояние запроса,
 * повтор ничего не изменит. 0 — сетевой сбой, самый частый кандидат на повтор.
 */
export const isRetriable = (status: number): boolean =>
	status === 0 || status === 408 || status === 429 || (status >= 500 && status < 600)
// #endregion

// #region API-10 | Заголовок Retry-After
/**
 * Формата два: секунды числом и HTTP-дата. Отрицательную задержку зажимаем нулём —
 * дата могла уже пройти, пока ответ ехал по сети.
 */
export const parseRetryAfter = (header: string | null, now: number): number => {
	if (!header) return 0

	const seconds = Number(header)
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

	const date = Date.parse(header)
	if (Number.isNaN(date)) return 0
	return Math.max(0, date - now)
}
// #endregion

// #region API-11 | Запрос с повторами
/**
 * attempts — общее число попыток, а не дополнительных. Задержка удваивается,
 * но Retry-After от сервера важнее собственных расчётов.
 * Последняя попытка возвращается как есть: решение, что делать с ошибкой, принимает вызывающий.
 */
export const fetchRetry = async (url: string, attempts: number, baseDelay = 100): Promise<Response> => {
	let lastError: unknown = null

	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const response = await fetch(url)
			if (response.ok || !isRetriable(response.status) || attempt === attempts) return response

			const fromHeader = parseRetryAfter(response.headers.get('Retry-After'), Date.now())
			await sleep(fromHeader || baseDelay * 2 ** (attempt - 1))
		} catch (error) {
			lastError = error
			if (attempt === attempts) break
			await sleep(baseDelay * 2 ** (attempt - 1))
		}
	}
	throw new ApiError(0, lastError instanceof Error ? lastError.message : 'Сетевая ошибка')
}
// #endregion

// #region API-12 | Все страницы
/**
 * Последовательный цикл, а не Promise.all: следующий адрес известен только после ответа.
 * limit — защита от кольца в курсорах, без него кривой бэкенд вешает вкладку.
 */
export type Paged<T> = { items: T[]; next: string | null }

export const fetchAllPages = async <T>(
	firstUrl: string,
	load: (url: string) => Promise<Paged<T>>,
	limit = 50
): Promise<T[]> => {
	const result: T[] = []
	let url: string | null = firstUrl

	for (let page = 0; url !== null && page < limit; page += 1) {
		const response: Paged<T> = await load(url)
		result.push(...response.items)
		url = response.next
	}
	return result
}
// #endregion

// #region API-13 | Распаковка конверта
/** Ответ без конверта возвращаем как есть — так функция переживает смену формата API. */
export const unwrapEnvelope = <T>(payload: unknown): T => {
	if (!isPlainObject(payload)) return payload as T

	const error = payload.error
	if (isPlainObject(error)) {
		const status = typeof error.code === 'number' ? error.code : 0
		const message = typeof error.message === 'string' ? error.message : 'Ошибка запроса'
		throw new ApiError(status, message, error)
	}

	return ('data' in payload ? payload.data : payload) as T
}
// #endregion

// #region API-14 | Человеческое сообщение об ошибке
/** Пользователю нужен не код, а следующий шаг. Диапазон 5xx проверяется после точных совпадений. */
export const errorMessage = (status: number): string => {
	const known: Record<number, string> = {
		0: 'Нет связи с сервером',
		400: 'Неверный запрос',
		401: 'Нужно войти',
		403: 'Нет доступа',
		404: 'Не найдено',
		408: 'Сервер не ответил вовремя',
		429: 'Слишком много запросов',
		504: 'Сервер не ответил вовремя',
	}

	if (status in known) return known[status]
	if (status >= 500 && status < 600) return 'Ошибка на сервере'
	return 'Что-то пошло не так'
}
// #endregion

// #region API-15 | Ключ запроса
/**
 * Ключи параметров сортируются — { a, b } и { b, a } обязаны дать один ключ,
 * иначе кэш промахивается из-за порядка полей в коде.
 * Метод в верхний регистр: 'get' и 'GET' — один и тот же запрос.
 */
export const requestKey = (method: string, url: string, params?: Record<string, unknown>): string => {
	const sorted = Object.entries(params ?? {})
		.filter(([, value]) => value !== undefined)
		.sort(([a], [b]) => a.localeCompare(b))

	return `${method.toUpperCase()} ${url}?${sorted.map(([key, value]) => `${key}=${String(value)}`).join('&')}`
}
// #endregion

// #region API-16 | Отдать из кэша и обновить
/**
 * Запись хранит значение, время и текущий запрос обновления.
 * Протухшее значение отдаём немедленно, а обновление пускаем в фон и ЗАПОМИНАЕМ промис —
 * иначе десять компонентов при монтировании дадут десять одинаковых запросов.
 * catch на фоновом обновлении обязателен, иначе получим unhandled rejection.
 */
export type SWR<T> = { read: (key: string) => Promise<T>; size: () => number }

export const staleWhileRevalidate = <T>(loader: (key: string) => Promise<T>, ttl: number): SWR<T> => {
	type Entry = { value: T; time: number; inflight: Promise<T> | null }
	const cache = new Map<string, Entry>()

	const load = (key: string, entry: Entry | undefined): Promise<T> => {
		if (entry?.inflight) return entry.inflight

		const inflight = loader(key)
			.then(value => {
				cache.set(key, { value, time: Date.now(), inflight: null })
				return value
			})
			.catch(error => {
				if (entry) cache.set(key, { ...entry, inflight: null })
				else cache.delete(key)
				throw error
			})

		if (entry) cache.set(key, { ...entry, inflight })
		else cache.set(key, { value: undefined as T, time: 0, inflight })
		return inflight
	}

	return {
		read: key => {
			const entry = cache.get(key)
			if (!entry || entry.time === 0) return load(key, entry)

			if (Date.now() - entry.time >= ttl) {
				void load(key, entry).catch(() => undefined)
			}
			return Promise.resolve(entry.value)
		},
		size: () => cache.size,
	}
}
// #endregion

// #region API-17 | Новый запрос отменяет прошлый
/**
 * Контроллер живёт между вызовами в замыкании. Новый вызов сначала отменяет старый,
 * потом создаёт свой. Сеть при этом действительно обрывается — в отличие от приёма
 * «игнорировать результат устаревшего промиса».
 */
export const cancelPrevious = <T>(fn: (signal: AbortSignal) => Promise<T>): (() => Promise<T>) => {
	let controller: AbortController | null = null

	return () => {
		controller?.abort(new Error('Отменено новым запросом'))
		controller = new AbortController()
		return fn(controller.signal)
	}
}
// #endregion

// #region API-18 | Мини-клиент
/**
 * Заголовки вызова кладутся ПОСЛЕ дефолтных — поэтому перекрывают их.
 * Content-Type ставится только там, где есть тело.
 */
export type ApiClient = {
	get: <T>(path: string, params?: Record<string, unknown>) => Promise<T>
	post: <T>(path: string, body: unknown, options?: RequestInit) => Promise<T>
}

export const createApiClient = (baseUrl: string, defaultHeaders: Record<string, string> = {}): ApiClient => ({
	get: <T>(path: string, params?: Record<string, unknown>) =>
		fetchJson<T>(buildUrl(baseUrl, path, params), { headers: { ...defaultHeaders } }),

	post: <T>(path: string, body: unknown, options: RequestInit = {}) =>
		fetchJson<T>(buildUrl(baseUrl, path), {
			method: 'POST',
			...options,
			headers: {
				'Content-Type': 'application/json',
				...defaultHeaders,
				...(options.headers as Record<string, string> | undefined),
			},
			body: JSON.stringify(body),
		}),
})
// #endregion

// #region API-19 | Перехватчики
/**
 * onError может как подменить результат (вернуть значение), так и пробросить дальше.
 * Если хука нет — ошибка летит наверх без изменений.
 */
export type Interceptors<A, R> = {
	onRequest?: (args: A) => A
	onResponse?: (result: R) => R
	onError?: (error: unknown) => never | R
}

export const withInterceptors =
	<A, R>(fn: (args: A) => Promise<R>, interceptors: Interceptors<A, R>): ((args: A) => Promise<R>) =>
	async args => {
		const prepared = interceptors.onRequest ? interceptors.onRequest(args) : args
		try {
			const result = await fn(prepared)
			return interceptors.onResponse ? interceptors.onResponse(result) : result
		} catch (error) {
			if (interceptors.onError) return interceptors.onError(error)
			throw error
		}
	}
// #endregion

// #region API-20 | Объект в FormData
/**
 * FormData приводит всё к строке сам, кроме Blob и File — их надо класть как есть.
 * null и undefined пропускаем: иначе на сервер уедут строки 'null'.
 */
export const toFormData = (data: Record<string, unknown>): FormData => {
	const form = new FormData()

	const append = (key: string, value: unknown): void => {
		if (value === undefined || value === null) return
		if (value instanceof Blob) form.append(key, value)
		else form.append(key, String(value))
	}

	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) for (const item of value) append(key, item)
		else append(key, value)
	}
	return form
}
// #endregion
