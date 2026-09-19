/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 15. Открывать только после своей попытки.
 */

// #region BRW-01 | Параметры адреса
/** URL и URLSearchParams делают разбор и декодирование сами — руками парсить нечего. */
export const getQueryParams = (url: string): Record<string, string | string[]> => {
	const search = new URL(url).searchParams
	const result: Record<string, string | string[]> = {}

	for (const key of new Set(search.keys())) {
		const values = search.getAll(key)
		result[key] = values.length > 1 ? values : values[0]
	}
	return result
}
// #endregion

// #region BRW-02 | Обновить параметры
/**
 * Работаем с копией URL, а не со строкой: путь, порт и хэш сохраняются сами.
 * null и undefined именно УДАЛЯЮТ параметр — так «сбросить фильтр» и «поставить значение»
 * делаются одной функцией.
 */
export const updateQuery = (url: string, patch: Record<string, unknown>): string => {
	const result = new URL(url)

	for (const [key, value] of Object.entries(patch)) {
		if (value === null || value === undefined) result.searchParams.delete(key)
		else result.searchParams.set(key, String(value))
	}
	return result.toString()
}
// #endregion

// #region BRW-03 | Разбор хэш-маршрута
/**
 * Шаблон и путь сравниваются посегментно. Сегмент с двоеточием — это имя параметра,
 * остальные должны совпасть буквально. Разное число сегментов — маршрут не подошёл.
 */
export type Route = { path: string; params: Record<string, string>; query: Record<string, string> }

export const parseHashRoute = (hash: string, template: string): Route => {
	const clean = hash.replace(/^#/, '')
	const [path, search = ''] = clean.split('?')

	const query: Record<string, string> = {}
	for (const [key, value] of new URLSearchParams(search)) query[key] = value

	const pathParts = path.split('/').filter(Boolean)
	const templateParts = template.split('/').filter(Boolean)

	const params: Record<string, string> = {}
	if (pathParts.length === templateParts.length) {
		for (let i = 0; i < templateParts.length; i += 1) {
			const part = templateParts[i]
			if (part.startsWith(':')) params[part.slice(1)] = pathParts[i]
			else if (part !== pathParts[i]) return { path, params: {}, query }
		}
	}
	return { path, params, query }
}
// #endregion

// #region BRW-04 | Безопасное хранилище
/**
 * Три места, где localStorage бросает исключение: приватный режим Safari,
 * переполнение квоты и полностью отключённое хранилище.
 * Поэтому каждый вызов в try/catch, а set возвращает признак успеха —
 * вызывающий решает, показывать ли предупреждение.
 */
export type SafeStorage = {
	get: <T>(key: string, fallback: T) => T
	set: (key: string, value: unknown) => boolean
	remove: (key: string) => void
}

export const createSafeStorage = (storage: Storage = localStorage): SafeStorage => ({
	get: <T>(key: string, fallback: T): T => {
		try {
			const raw = storage.getItem(key)
			return raw === null ? fallback : (JSON.parse(raw) as T)
		} catch {
			return fallback
		}
	},

	set: (key: string, value: unknown): boolean => {
		try {
			storage.setItem(key, JSON.stringify(value))
			return true
		} catch {
			return false
		}
	},

	remove: (key: string): void => {
		try {
			storage.removeItem(key)
		} catch {
			// Хранилище недоступно — удалять нечего.
		}
	},
})
// #endregion

// #region BRW-05 | Хранилище со сроком годности
/**
 * Срок хранится рядом со значением: у localStorage своего TTL нет.
 * Просроченная запись удаляется при чтении — иначе мусор живёт вечно
 * и однажды упирается в квоту.
 */
export type TtlStorage = {
	set: (key: string, value: unknown, ttl: number, now: number) => void
	get: <T>(key: string, now: number) => T | null
}

export const createTtlStorage = (storage: Storage = localStorage): TtlStorage => {
	const safe = createSafeStorage(storage)

	return {
		set: (key, value, ttl, now) => {
			safe.set(key, { value, expires: now + ttl })
		},

		get: <T>(key: string, now: number): T | null => {
			const record = safe.get<{ value: T; expires: number } | null>(key, null)
			if (!record || typeof record.expires !== 'number') return null

			if (now >= record.expires) {
				safe.remove(key)
				return null
			}
			return record.value
		},
	}
}
// #endregion

// #region BRW-06 | Подписка с отпиской
/** Возврат функции отписки — стандартный приём: подписка и снятие не расходятся по коду. */
export const onEvent = <K extends keyof HTMLElementEventMap>(
	target: HTMLElement,
	type: K,
	handler: (event: HTMLElementEventMap[K]) => void
): (() => void) => {
	target.addEventListener(type, handler as EventListener)
	return () => target.removeEventListener(type, handler as EventListener)
}
// #endregion

// #region BRW-07 | Делегирование событий
/**
 * closest поднимается от цели вверх и находит подходящего предка,
 * проверка contains не даёт сработать на элементах вне контейнера
 * (closest мог уйти выше него).
 * Плюс приёма: элементы, добавленные после подписки, работают без новых обработчиков.
 */
export const delegate = (
	container: HTMLElement,
	selector: string,
	type: string,
	handler: (event: Event, target: HTMLElement) => void
): (() => void) => {
	const listener = (event: Event): void => {
		const target = event.target as HTMLElement | null
		const found = target?.closest<HTMLElement>(selector)
		if (found && container.contains(found)) handler(event, found)
	}

	container.addEventListener(type, listener)
	return () => container.removeEventListener(type, listener)
}
// #endregion

// #region BRW-08 | Клик снаружи
/**
 * contains проверяет и сам элемент, и его потомков: клик по кнопке внутри меню
 * не должен закрывать меню.
 */
export const onOutsideClick = (element: HTMLElement, handler: () => void): (() => void) => {
	const listener = (event: MouseEvent): void => {
		const target = event.target as Node | null
		if (target && !element.contains(target)) handler()
	}

	document.addEventListener('click', listener)
	return () => document.removeEventListener('click', listener)
}
// #endregion

// #region BRW-09 | Элемент виден
/**
 * Проверяются ПЕРЕСЕЧЕНИЯ, а не полное попадание: элемент виден,
 * если его нижняя граница ниже верха окна и верхняя — выше низа окна.
 * В проде для этого берут IntersectionObserver: он не заставляет браузер
 * пересчитывать раскладку на каждый скролл.
 */
export const isInViewport = (element: HTMLElement): boolean => {
	const rect = element.getBoundingClientRect()

	return rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth
}
// #endregion

// #region BRW-10 | Блокировка прокрутки
/** Прежнее значение запоминается в замыкании: страница могла иметь свой overflow. */
export const lockScroll = (): (() => void) => {
	const previous = document.body.style.overflow
	document.body.style.overflow = 'hidden'

	return () => {
		document.body.style.overflow = previous
	}
}
// #endregion

// #region BRW-11 | Создание элемента
/**
 * Разделение на свойства и атрибуты не косметика: className и textContent —
 * это свойства DOM-объекта, а data-* и aria-* живут только как атрибуты.
 * Обработчики по ключу onClick снимают нужду в отдельном addEventListener.
 */
export type Props = Record<string, unknown>

export const el = (tag: string, props: Props = {}, children: Array<Node | string> = []): HTMLElement => {
	const node = document.createElement(tag)

	for (const [key, value] of Object.entries(props)) {
		if (value === null || value === undefined) continue

		if (key.startsWith('on') && typeof value === 'function') {
			node.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
		} else if (key === 'className' || key === 'textContent' || key === 'value') {
			;(node as unknown as Record<string, unknown>)[key] = value
		} else {
			node.setAttribute(key, String(value))
		}
	}

	for (const child of children) {
		node.append(typeof child === 'string' ? document.createTextNode(child) : child)
	}
	return node
}
// #endregion

// #region BRW-12 | Отрисовка списка
/**
 * Фрагмент собирается в памяти и вставляется ОДИН раз — браузер пересчитывает
 * раскладку однажды, а не на каждый пункт.
 * replaceChildren чистит контейнер без innerHTML = '' и без утечек обработчиков.
 */
export const renderList = (container: HTMLElement, items: string[]): void => {
	const fragment = document.createDocumentFragment()

	for (const item of items) {
		const li = document.createElement('li')
		li.textContent = item
		fragment.append(li)
	}

	container.replaceChildren(fragment)
}
// #endregion

// #region BRW-13 | Форма в объект
/**
 * FormData сам собирает поля с name и пропускает отключённые и безымянные.
 * getAll даёт все значения ключа — так чекбоксы с одинаковым name становятся массивом.
 */
export const formToObject = (form: HTMLFormElement): Record<string, string | string[]> => {
	const data = new FormData(form)
	const result: Record<string, string | string[]> = {}

	for (const key of new Set(data.keys())) {
		const values = data.getAll(key).map(value => (typeof value === 'string' ? value : value.name))
		result[key] = values.length > 1 ? values : values[0]
	}
	return result
}
// #endregion

// #region BRW-14 | Куки
/**
 * document.cookie — строка вида 'a=1; b=2', отдельного API нет.
 * Удаление — это запись с прошедшей датой: другого способа нет.
 * path=/ обязателен, иначе кука удалится только на текущем пути.
 */
export const getCookie = (name: string): string | null => {
	const pairs = document.cookie.split(';')

	for (const pair of pairs) {
		const [key, ...rest] = pair.trim().split('=')
		if (key === name) return decodeURIComponent(rest.join('='))
	}
	return null
}

export const setCookie = (name: string, value: string, days?: number): void => {
	const parts = [`${name}=${encodeURIComponent(value)}`, 'path=/']

	if (days !== undefined) {
		parts.push(`expires=${new Date(Date.now() + days * 86_400_000).toUTCString()}`)
	}
	document.cookie = parts.join('; ')
}

export const deleteCookie = (name: string): void => {
	document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
// #endregion

// #region BRW-15 | Тёмная тема
/**
 * matchMedia отдаёт и текущее состояние, и события смены — без опроса в цикле.
 * addEventListener('change') — современный способ; addListener оставлен
 * только для старых Safari.
 */
export const prefersDark = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches

export const onColorSchemeChange = (handler: (dark: boolean) => void): (() => void) => {
	const query = window.matchMedia('(prefers-color-scheme: dark)')
	const listener = (event: MediaQueryListEvent): void => handler(event.matches)

	query.addEventListener('change', listener)
	return () => query.removeEventListener('change', listener)
}
// #endregion

// #region BRW-16 | Ловушка фокуса
/**
 * Список фокусируемых пересобирается на каждое нажатие: содержимое модалки могло измениться.
 * preventDefault обязателен — иначе браузер после ручного focus() сделает свой переход.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export const trapFocus = (container: HTMLElement): (() => void) => {
	const listener = (event: KeyboardEvent): void => {
		if (event.key !== 'Tab') return

		const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
		if (focusable.length === 0) return

		const first = focusable[0]
		const last = focusable[focusable.length - 1]
		const active = document.activeElement

		if (event.shiftKey && active === first) {
			event.preventDefault()
			last.focus()
		} else if (!event.shiftKey && active === last) {
			event.preventDefault()
			first.focus()
		}
	}

	container.addEventListener('keydown', listener)
	return () => container.removeEventListener('keydown', listener)
}
// #endregion

// #region BRW-17 | Дождаться элемента
/**
 * Сначала проверка «а вдруг уже есть» — иначе наблюдатель не сработает,
 * потому что изменений больше не будет.
 * Наблюдатель и таймер снимаются в одном месте: любой выход должен всё выключить,
 * иначе MutationObserver продолжит дёргаться на каждое изменение страницы.
 */
export const waitForElement = (selector: string, timeout: number): Promise<HTMLElement | null> => {
	const existing = document.querySelector<HTMLElement>(selector)
	if (existing) return Promise.resolve(existing)

	return new Promise(resolve => {
		const finish = (element: HTMLElement | null): void => {
			observer.disconnect()
			clearTimeout(timer)
			resolve(element)
		}

		const observer = new MutationObserver(() => {
			const found = document.querySelector<HTMLElement>(selector)
			if (found) finish(found)
		})

		const timer = setTimeout(() => finish(null), timeout)
		observer.observe(document.body, { childList: true, subtree: true })
	})
}
// #endregion

// #region BRW-18 | Троттлинг кадрами
/**
 * Один вызов на кадр: браузер всё равно не покажет больше.
 * Аргументы перезаписываются — выполняется САМОЕ СВЕЖЕЕ состояние, а не первое,
 * иначе при скролле обработчик работал бы по устаревшим координатам.
 */
export type RafThrottled<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void }

export const rafThrottle = <A extends unknown[]>(fn: (...args: A) => void): RafThrottled<A> => {
	let frame: number | null = null
	let lastArgs: A | null = null

	const throttled = (...args: A): void => {
		lastArgs = args
		if (frame !== null) return

		frame = requestAnimationFrame(() => {
			frame = null
			if (lastArgs) fn(...lastArgs)
		})
	}

	return Object.assign(throttled, {
		cancel: () => {
			if (frame !== null) cancelAnimationFrame(frame)
			frame = null
			lastArgs = null
		},
	})
}
// #endregion
