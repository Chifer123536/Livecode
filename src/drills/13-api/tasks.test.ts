import { afterEach, describe, expect, it, vi } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	ApiError,
	buildQuery,
	buildUrl,
	camelizeKeys,
	cancelPrevious,
	createApiClient,
	errorMessage,
	fetchAllPages,
	fetchJson,
	fetchRetry,
	fetchWithTimeout,
	isRetriable,
	parseQuery,
	parseRetryAfter,
	requestKey,
	snakeizeKeys,
	staleWhileRevalidate,
	toFormData,
	unwrapEnvelope,
	withInterceptors,
	type Paged,
} from './tasks'

const json = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

// #region API-01
describe('API-01 buildQuery', () => {
	it('кодирует значения', () => expect(buildQuery({ q: 'a b' })).toBe('q=a+b'))
	it('выбрасывает undefined и null', () => expect(buildQuery({ a: 1, b: undefined, c: null })).toBe('a=1'))
	it('массив повторяет ключ', () => expect(buildQuery({ tag: ['a', 'b'] })).toBe('tag=a&tag=b'))
	it('пустой объект', () => expect(buildQuery({})).toBe(''))
	it('ноль и false не теряются', () => expect(buildQuery({ page: 0, flag: false })).toBe('page=0&flag=false'))
})
// #endregion

// #region API-02
describe('API-02 parseQuery', () => {
	it('разбирает строку', () => expect(parseQuery('page=2&q=abc')).toEqual({ page: '2', q: 'abc' }))
	it('ведущий вопрос отбрасывается', () => expect(parseQuery('?page=2')).toEqual({ page: '2' }))
	it('повторы становятся массивом', () => expect(parseQuery('tag=a&tag=b')).toEqual({ tag: ['a', 'b'] }))
	it('пустая строка', () => expect(parseQuery('')).toEqual({}))
	it('декодирует значения', () => expect(parseQuery('q=a%20b')).toEqual({ q: 'a b' }))
})
// #endregion

// #region API-03
describe('API-03 buildUrl', () => {
	it('без двойных слэшей', () => expect(buildUrl('https://api.dev/', '/users')).toBe('https://api.dev/users'))
	it('с параметрами', () => expect(buildUrl('https://api.dev', 'users', { page: 2 })).toBe('https://api.dev/users?page=2'))
	it('пустые параметры не добавляют вопрос', () => expect(buildUrl('https://api.dev', 'users', {})).toBe('https://api.dev/users'))
})
// #endregion

// #region API-04
describe('API-04 camelizeKeys', () => {
	it('переименовывает ключи', () => expect(camelizeKeys({ user_name: 'Ян' })).toEqual({ userName: 'Ян' }))
	it('работает вглубь', () => {
		expect(camelizeKeys({ items: [{ created_at: 1 }] })).toEqual({ items: [{ createdAt: 1 }] })
	})
	it('значения не трогает', () => expect(camelizeKeys({ a_b: 'не_меняй' })).toEqual({ aB: 'не_меняй' }))
	it('примитивы возвращаются как есть', () => expect(camelizeKeys(5)).toBe(5))
	it('Date не разбирается', () => {
		const date = new Date(0)
		expect((camelizeKeys({ created_at: date }) as { createdAt: Date }).createdAt).toBe(date)
	})
	it('null не ломает', () => expect(camelizeKeys({ a_b: null })).toEqual({ aB: null }))
})
// #endregion

// #region API-05
describe('API-05 snakeizeKeys', () => {
	it('переименовывает ключи', () => expect(snakeizeKeys({ userName: 'Ян' })).toEqual({ user_name: 'Ян' }))
	it('работает вглубь', () => {
		expect(snakeizeKeys({ items: [{ createdAt: 1 }] })).toEqual({ items: [{ created_at: 1 }] })
	})
	it('туда и обратно', () => expect(camelizeKeys(snakeizeKeys({ userName: 'Ян' }))).toEqual({ userName: 'Ян' }))
})
// #endregion

// #region API-06
describe('API-06 ApiError', () => {
	it('хранит статус и данные', () => {
		const error = new ApiError(404, 'Не найдено', { id: 1 })
		expect(error.status).toBe(404)
		expect(error.message).toBe('Не найдено')
		expect(error.data).toEqual({ id: 1 })
	})
	it('это настоящая ошибка', () => {
		const error = new ApiError(500, 'Ошибка')
		expect(error).toBeInstanceOf(Error)
		expect(error).toBeInstanceOf(ApiError)
	})
	it('у ошибки своё имя', () => expect(new ApiError(500, 'x').name).toBe('ApiError'))
})
// #endregion

// #region API-07
describe('API-07 fetchJson', () => {
	it('успешный ответ парсится', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({ id: 1 })))
		expect(await fetchJson('/users/1')).toEqual({ id: 1 })
	})
	it('на 404 бросает ApiError со статусом', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({ message: 'нет' }, 404)))
		await expect(fetchJson('/users/404')).rejects.toBeInstanceOf(ApiError)
		await expect(fetchJson('/users/404')).rejects.toMatchObject({ status: 404 })
	})
	it('тело ошибки сохраняется', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({ message: 'нет' }, 400)))
		await expect(fetchJson('/x')).rejects.toMatchObject({ data: { message: 'нет' } })
	})
	it('не-JSON в теле ошибки не роняет', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>500</html>', { status: 500 })))
		await expect(fetchJson('/x')).rejects.toMatchObject({ status: 500 })
	})
	it('204 возвращает null', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })))
		expect(await fetchJson('/x')).toBeNull()
	})
	it('пустое тело возвращает null', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 200 })))
		expect(await fetchJson('/x')).toBeNull()
	})
	it('сетевой сбой превращается в ApiError(0)', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('Failed to fetch')
			})
		)
		await expect(fetchJson('/x')).rejects.toMatchObject({ status: 0 })
	})
})
// #endregion

// #region API-08
describe('API-08 fetchWithTimeout', () => {
	/** fetch, который никогда не отвечает, но честно реагирует на отмену. */
	const hangingFetch = () =>
		vi.fn(
			(_url: string, options?: RequestInit) =>
				new Promise<Response>((_, reject) => {
					options?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
				})
		)

	it('обрывает долгий запрос', async () => {
		vi.stubGlobal('fetch', hangingFetch())
		await expect(fetchWithTimeout('/slow', 20)).rejects.toThrow()
	})
	it('быстрый ответ проходит', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({ ok: true })))
		const response = await fetchWithTimeout('/fast', 50)
		expect(response.ok).toBe(true)
	})
	it('передаёт signal в fetch', async () => {
		const mock = vi.fn(async (_url: string, _options?: RequestInit) => json({}))
		vi.stubGlobal('fetch', mock)
		await fetchWithTimeout('/x', 50)
		expect(mock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal)
	})
	it('внешняя отмена тоже работает', async () => {
		vi.stubGlobal('fetch', hangingFetch())
		const outer = new AbortController()
		const promise = fetchWithTimeout('/slow', 1000, { signal: outer.signal })
		outer.abort()
		await expect(promise).rejects.toThrow()
	})
	it('после успеха таймер не держит процесс', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({})))
		const spy = vi.spyOn(globalThis, 'clearTimeout')
		await fetchWithTimeout('/x', 1000)
		expect(spy).toHaveBeenCalled()
	})
})
// #endregion

// #region API-09
describe('API-09 isRetriable', () => {
	it('5xx повторяем', () => expect(isRetriable(500)).toBe(true))
	it('429 повторяем', () => expect(isRetriable(429)).toBe(true))
	it('408 повторяем', () => expect(isRetriable(408)).toBe(true))
	it('сетевой сбой повторяем', () => expect(isRetriable(0)).toBe(true))
	it('404 не повторяем', () => expect(isRetriable(404)).toBe(false))
	it('400 не повторяем', () => expect(isRetriable(400)).toBe(false))
	it('200 не повторяем', () => expect(isRetriable(200)).toBe(false))
})
// #endregion

// #region API-10
describe('API-10 parseRetryAfter', () => {
	const now = Date.UTC(2026, 2, 5, 12, 0, 0)
	it('секунды', () => expect(parseRetryAfter('3', now)).toBe(3000))
	it('дата', () => {
		const header = new Date(now + 5000).toUTCString()
		expect(parseRetryAfter(header, now)).toBe(5000)
	})
	it('нет заголовка', () => expect(parseRetryAfter(null, now)).toBe(0))
	it('мусор', () => expect(parseRetryAfter('позже', now)).toBe(0))
	it('прошедшая дата — ноль', () => {
		expect(parseRetryAfter(new Date(now - 5000).toUTCString(), now)).toBe(0)
	})
})
// #endregion

// #region API-11
describe('API-11 fetchRetry', () => {
	it('повторяет 500 и отдаёт успешный ответ', async () => {
		const mock = vi
			.fn<() => Promise<Response>>()
			.mockResolvedValueOnce(json({}, 500))
			.mockResolvedValueOnce(json({ ok: true }, 200))
		vi.stubGlobal('fetch', mock)

		const response = await fetchRetry('/x', 3, 1)
		expect(response.status).toBe(200)
		expect(mock).toHaveBeenCalledTimes(2)
	})
	it('не повторяет 404', async () => {
		const mock = vi.fn(async () => json({}, 404))
		vi.stubGlobal('fetch', mock)

		const response = await fetchRetry('/x', 3, 1)
		expect(response.status).toBe(404)
		expect(mock).toHaveBeenCalledTimes(1)
	})
	it('исчерпал попытки — отдаёт последний ответ', async () => {
		const mock = vi.fn(async () => json({}, 503))
		vi.stubGlobal('fetch', mock)

		const response = await fetchRetry('/x', 2, 1)
		expect(response.status).toBe(503)
		expect(mock).toHaveBeenCalledTimes(2)
	})
	it('учитывает Retry-After', async () => {
		const mock = vi
			.fn<() => Promise<Response>>()
			.mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '0' } }))
			.mockResolvedValueOnce(json({}, 200))
		vi.stubGlobal('fetch', mock)

		expect((await fetchRetry('/x', 3, 1)).status).toBe(200)
	})
	it('сетевой сбой на всех попытках — ApiError', async () => {
		const mock = vi.fn(async () => {
			throw new TypeError('Failed to fetch')
		})
		vi.stubGlobal('fetch', mock)

		await expect(fetchRetry('/x', 2, 1)).rejects.toBeInstanceOf(ApiError)
		expect(mock).toHaveBeenCalledTimes(2)
	})
})
// #endregion

// #region API-12
describe('API-12 fetchAllPages', () => {
	it('собирает все страницы', async () => {
		const pages: Record<string, Paged<number>> = {
			'/p1': { items: [1, 2], next: '/p2' },
			'/p2': { items: [3], next: null },
		}
		const load = vi.fn(async (url: string) => pages[url])

		expect(await fetchAllPages('/p1', load)).toEqual([1, 2, 3])
		expect(load).toHaveBeenCalledTimes(2)
	})
	it('одна страница', async () => {
		const load = async () => ({ items: ['a'], next: null })
		expect(await fetchAllPages('/p1', load)).toEqual(['a'])
	})
	it('предохранитель от бесконечного курсора', async () => {
		const load = vi.fn(async () => ({ items: [1], next: '/loop' }))
		expect(await fetchAllPages('/loop', load, 3)).toEqual([1, 1, 1])
		expect(load).toHaveBeenCalledTimes(3)
	})
})
// #endregion

// #region API-13
describe('API-13 unwrapEnvelope', () => {
	it('достаёт data', () => expect(unwrapEnvelope({ data: [1] })).toEqual([1]))
	it('бросает ApiError на error', () => {
		expect(() => unwrapEnvelope({ error: { message: 'нет', code: 404 } })).toThrow(ApiError)
	})
	it('статус берётся из code', () => {
		try {
			unwrapEnvelope({ error: { message: 'нет', code: 403 } })
			expect.unreachable()
		} catch (error) {
			expect((error as ApiError).status).toBe(403)
		}
	})
	it('ответ без конверта возвращается как есть', () => {
		expect(unwrapEnvelope([1, 2])).toEqual([1, 2])
	})
	it('null не ломает', () => expect(unwrapEnvelope(null)).toBeNull())
})
// #endregion

// #region API-14
describe('API-14 errorMessage', () => {
	it('нет связи', () => expect(errorMessage(0)).toBe('Нет связи с сервером'))
	it('401', () => expect(errorMessage(401)).toBe('Нужно войти'))
	it('404', () => expect(errorMessage(404)).toBe('Не найдено'))
	it('429', () => expect(errorMessage(429)).toBe('Слишком много запросов'))
	it('502 — общая серверная', () => expect(errorMessage(502)).toBe('Ошибка на сервере'))
	it('504 — таймаут', () => expect(errorMessage(504)).toBe('Сервер не ответил вовремя'))
	it('неизвестный код', () => expect(errorMessage(418)).toBe('Что-то пошло не так'))
})
// #endregion

// #region API-15
describe('API-15 requestKey', () => {
	it('порядок полей не влияет', () => {
		expect(requestKey('get', '/users', { b: 2, a: 1 })).toBe(requestKey('GET', '/users', { a: 1, b: 2 }))
	})
	it('разные параметры — разные ключи', () => {
		expect(requestKey('GET', '/users', { a: 1 })).not.toBe(requestKey('GET', '/users', { a: 2 }))
	})
	it('разные пути — разные ключи', () => {
		expect(requestKey('GET', '/a')).not.toBe(requestKey('GET', '/b'))
	})
	it('метод учитывается', () => {
		expect(requestKey('GET', '/a')).not.toBe(requestKey('POST', '/a'))
	})
	it('без параметров не падает', () => expect(typeof requestKey('GET', '/a')).toBe('string'))
})
// #endregion

// #region API-16
describe('API-16 staleWhileRevalidate', () => {
	it('первый вызов идёт к загрузчику', async () => {
		const loader = vi.fn(async (key: string) => `значение ${key}`)
		const swr = staleWhileRevalidate(loader, 50)

		expect(await swr.read('a')).toBe('значение a')
		expect(loader).toHaveBeenCalledTimes(1)
	})
	it('свежее значение берётся из кэша', async () => {
		const loader = vi.fn(async () => 'x')
		const swr = staleWhileRevalidate(loader, 50)

		await swr.read('a')
		await swr.read('a')
		expect(loader).toHaveBeenCalledTimes(1)
	})
	it('протухшее отдаётся сразу, обновление идёт в фоне', async () => {
		let counter = 0
		const loader = vi.fn(async () => {
			counter += 1
			return counter
		})
		const swr = staleWhileRevalidate(loader, 30)

		expect(await swr.read('a')).toBe(1)
		await sleep(45)
		expect(await swr.read('a')).toBe(1)
		await sleep(10)
		expect(await swr.read('a')).toBe(2)
		expect(loader).toHaveBeenCalledTimes(2)
	})
	it('параллельные вызовы не плодят запросы', async () => {
		const loader = vi.fn(async () => {
			await sleep(10)
			return 'x'
		})
		const swr = staleWhileRevalidate(loader, 50)

		await Promise.all([swr.read('a'), swr.read('a'), swr.read('a')])
		expect(loader).toHaveBeenCalledTimes(1)
	})
	it('ошибка загрузчика пробрасывается', async () => {
		const swr = staleWhileRevalidate(async () => {
			throw new Error('сломалось')
		}, 50)
		await expect(swr.read('a')).rejects.toThrow('сломалось')
	})
})
// #endregion

// #region API-17
describe('API-17 cancelPrevious', () => {
	const makeRequest = () =>
		vi.fn(
			(signal: AbortSignal) =>
				new Promise<string>((resolve, reject) => {
					const timer = setTimeout(() => resolve('готово'), 20)
					signal.addEventListener('abort', () => {
						clearTimeout(timer)
						reject(new Error('отменён'))
					})
				})
		)

	it('предыдущий запрос отменяется', async () => {
		const run = cancelPrevious(makeRequest())
		const first = run()
		const second = run()

		await expect(first).rejects.toThrow('отменён')
		await expect(second).resolves.toBe('готово')
	})
	it('одиночный вызов работает', async () => {
		const run = cancelPrevious(makeRequest())
		await expect(run()).resolves.toBe('готово')
	})
	it('в fn приходит свежий signal', async () => {
		const fn = makeRequest()
		const run = cancelPrevious(fn)
		const first = run()
		const second = run()
		await first.catch(() => undefined)
		await second

		expect(fn.mock.calls[0][0]).not.toBe(fn.mock.calls[1][0])
		expect(fn.mock.calls[0][0].aborted).toBe(true)
		expect(fn.mock.calls[1][0].aborted).toBe(false)
	})
})
// #endregion

// #region API-18
describe('API-18 createApiClient', () => {
	it('get собирает адрес с параметрами', async () => {
		const mock = vi.fn(async (_url: string, _options?: RequestInit) => json({ ok: true }))
		vi.stubGlobal('fetch', mock)

		const api = createApiClient('https://api.dev')
		await api.get('/users', { page: 2 })
		expect(mock.mock.calls[0][0]).toBe('https://api.dev/users?page=2')
	})
	it('post сериализует тело и ставит Content-Type', async () => {
		const mock = vi.fn(async (_url: string, _options?: RequestInit) => json({ ok: true }))
		vi.stubGlobal('fetch', mock)

		const api = createApiClient('https://api.dev')
		await api.post('/users', { name: 'Ян' })

		const options = mock.mock.calls[0][1] as RequestInit
		expect(options.method).toBe('POST')
		expect(options.body).toBe('{"name":"Ян"}')
		expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
	})
	it('дефолтные заголовки уходят в запрос', async () => {
		const mock = vi.fn(async (_url: string, _options?: RequestInit) => json({}))
		vi.stubGlobal('fetch', mock)

		const api = createApiClient('https://api.dev', { Authorization: 'Bearer t' })
		await api.get('/me')

		const options = mock.mock.calls[0][1] as RequestInit
		expect((options.headers as Record<string, string>).Authorization).toBe('Bearer t')
	})
	it('заголовки вызова перекрывают дефолтные', async () => {
		const mock = vi.fn(async (_url: string, _options?: RequestInit) => json({}))
		vi.stubGlobal('fetch', mock)

		const api = createApiClient('https://api.dev', { Authorization: 'Bearer t' })
		await api.post('/me', {}, { headers: { Authorization: 'Bearer new' } })

		const options = mock.mock.calls[0][1] as RequestInit
		expect((options.headers as Record<string, string>).Authorization).toBe('Bearer new')
	})
	it('ошибка пробрасывается как ApiError', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => json({}, 500)))
		const api = createApiClient('https://api.dev')
		await expect(api.get('/x')).rejects.toBeInstanceOf(ApiError)
	})
})
// #endregion

// #region API-19
describe('API-19 withInterceptors', () => {
	it('onRequest меняет аргументы', async () => {
		const fn = vi.fn(async (args: { token?: string }) => args)
		const wrapped = withInterceptors(fn, { onRequest: args => ({ ...args, token: 't' }) })

		expect(await wrapped({})).toEqual({ token: 't' })
	})
	it('onResponse меняет результат', async () => {
		const wrapped = withInterceptors(async (n: number) => n, { onResponse: result => result * 2 })
		expect(await wrapped(21)).toBe(42)
	})
	it('onError подменяет ошибку результатом', async () => {
		const wrapped = withInterceptors(
			async () => {
				throw new Error('упало')
			},
			{ onError: () => 'запасное' }
		)
		expect(await wrapped(undefined)).toBe('запасное')
	})
	it('без onError ошибка летит наверх', async () => {
		const wrapped = withInterceptors(async () => {
			throw new Error('упало')
		}, {})
		await expect(wrapped(undefined)).rejects.toThrow('упало')
	})
	it('без хуков работает как исходная функция', async () => {
		const wrapped = withInterceptors(async (n: number) => n + 1, {})
		expect(await wrapped(1)).toBe(2)
	})
})
// #endregion

// #region API-20
describe('API-20 toFormData', () => {
	it('кладёт значения', () => {
		const form = toFormData({ title: 'a', count: 2 })
		expect(form.get('title')).toBe('a')
		expect(form.get('count')).toBe('2')
	})
	it('массив — несколько значений одного ключа', () => {
		expect(toFormData({ tag: ['x', 'y'] }).getAll('tag')).toEqual(['x', 'y'])
	})
	it('null и undefined пропускаются', () => {
		const form = toFormData({ a: null, b: undefined, c: 1 })
		expect(form.has('a')).toBe(false)
		expect(form.has('b')).toBe(false)
		expect(form.has('c')).toBe(true)
	})
	it('Blob кладётся как файл, а не как строка', () => {
		const form = toFormData({ file: new Blob(['данные']) })
		expect(form.get('file')).toBeInstanceOf(Blob)
	})
	it('это настоящий FormData', () => expect(toFormData({})).toBeInstanceOf(FormData))
})
// #endregion
