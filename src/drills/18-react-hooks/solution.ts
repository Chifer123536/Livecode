import { useCallback, useEffect, useRef, useState } from 'react'
import type { DependencyList, EffectCallback, RefObject } from 'react'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 18. Открывать только после своей попытки.
 *
 * Сквозной приём всего пака: «свежий колбэк в ref».
 * Если положить функцию в зависимости эффекта, подписка будет пересоздаваться на каждый рендер.
 * Если не положить — внутри останется устаревшее замыкание. Ref решает обе проблемы сразу.
 */

// #region RH-01 | useToggle
/** setValue из useState стабилен между рендерами, его можно отдавать наружу как есть. */
export function useToggle(initial = false): [boolean, () => void, (next: boolean) => void] {
	const [value, setValue] = useState(initial)
	const toggle = useCallback(() => setValue(v => !v), [])
	return [value, toggle, setValue]
}
// #endregion

// #region RH-02 | useCounter
/**
 * Зажатие делается внутри апдейтера, а не снаружи: только так оно применяется
 * к актуальному значению при нескольких вызовах подряд.
 */
export type CounterApi = {
	count: number
	inc: () => void
	dec: () => void
	reset: () => void
	set: (next: number) => void
}
export function useCounter(initial = 0, bounds?: { min?: number; max?: number }): CounterApi {
	const { min = -Infinity, max = Infinity } = bounds ?? {}
	const clamp = useCallback((n: number) => Math.min(max, Math.max(min, n)), [min, max])
	const [count, setCount] = useState(() => clamp(initial))

	const inc = useCallback(() => setCount(c => clamp(c + 1)), [clamp])
	const dec = useCallback(() => setCount(c => clamp(c - 1)), [clamp])
	const reset = useCallback(() => setCount(clamp(initial)), [clamp, initial])
	const set = useCallback((next: number) => setCount(clamp(next)), [clamp])

	return { count, inc, dec, reset, set }
}
// #endregion

// #region RH-03 | useInput
/** Тип события намеренно узкий: хук не обязан знать про React.ChangeEvent, ему нужен только value. */
export type InputApi = {
	value: string
	onChange: (event: { target: { value: string } }) => void
	reset: () => void
}
export function useInput(initial = ''): InputApi {
	const [value, setValue] = useState(initial)
	const onChange = useCallback((event: { target: { value: string } }) => setValue(event.target.value), [])
	const reset = useCallback(() => setValue(initial), [initial])
	return { value, onChange, reset }
}
// #endregion

// #region RH-04 | usePrevious
/**
 * Во время рендера ref ещё хранит значение прошлого рендера, потому что эффект
 * выполняется ПОСЛЕ коммита. Этот сдвиг на один рендер и есть весь хук.
 */
export function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T | undefined>(undefined)
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}
// #endregion

// #region RH-05 | useUpdateEffect
/**
 * Флаг в ref переживает рендеры и не вызывает перерисовку.
 * useState здесь не подходит: его изменение дало бы лишний рендер.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
	const mounted = useRef(false)
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true
			return
		}
		return effect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)
}
// #endregion

// #region RH-06 | useIsMounted
/**
 * Возвращаем функцию, а не булево: булево «заморозилось» бы в замыкании потребителя.
 * Cleanup ставит false — после этого асинхронный колбэк не тронет состояние.
 */
export function useIsMounted(): () => boolean {
	const mounted = useRef(false)
	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
		}
	}, [])
	return useCallback(() => mounted.current, [])
}
// #endregion

// #region RH-07 | useLatest
/**
 * Присваивание прямо в теле рендера — намеренно: значение должно стать свежим
 * ещё до того, как выполнятся эффекты. Для «чистого» рендера это компромисс,
 * но именно так написан useLatest в популярных библиотеках.
 */
export function useLatest<T>(value: T): RefObject<T> {
	const ref = useRef(value)
	ref.current = value
	return ref
}
// #endregion

// #region RH-08 | useDebounce
/**
 * Схлопывание даёт именно cleanup: перед каждым новым эффектом React вызывает clearTimeout
 * предыдущего. Без cleanup таймеры копятся и стреляют все подряд.
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value)
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay)
		return () => clearTimeout(id)
	}, [value, delay])
	return debounced
}
// #endregion

// #region RH-09 | useDebouncedCallback
/**
 * fn держим в ref, поэтому возвращаемая функция стабильна и не тянет за собой
 * пересоздание эффектов у потребителя. Таймер обязательно чистить при размонтировании,
 * иначе колбэк выстрелит уже в мёртвый компонент.
 */
export function useDebouncedCallback<A extends unknown[]>(
	fn: (...args: A) => void,
	delay: number
): (...args: A) => void {
	const fnRef = useRef(fn)
	fnRef.current = fn
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[]
	)

	return useCallback(
		(...args: A) => {
			if (timerRef.current) clearTimeout(timerRef.current)
			timerRef.current = setTimeout(() => fnRef.current(...args), delay)
		},
		[delay]
	)
}
// #endregion

// #region RH-10 | useThrottledCallback
/**
 * Вариант по метке времени: не копит таймеры и не требует чистки.
 * Альтернатива через флаг isThrottled + setTimeout тоже принимается,
 * но тогда таймер надо снимать в cleanup.
 */
export function useThrottledCallback<A extends unknown[]>(
	fn: (...args: A) => void,
	interval: number
): (...args: A) => void {
	const fnRef = useRef(fn)
	fnRef.current = fn
	const lastCallRef = useRef(0)

	return useCallback(
		(...args: A) => {
			const now = Date.now()
			if (now - lastCallRef.current < interval) return
			lastCallRef.current = now
			fnRef.current(...args)
		},
		[interval]
	)
}
// #endregion

// #region RH-11 | useInterval
/**
 * Два эффекта специально: первый обновляет ссылку на колбэк, второй владеет интервалом.
 * Если положить callback в зависимости второго эффекта, интервал будет перезапускаться
 * на каждом рендере и никогда не досчитает до конца — это и есть суть задачи.
 */
export function useInterval(callback: () => void, delay: number | null): void {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback
	}, [callback])

	useEffect(() => {
		if (delay === null) return
		const id = setInterval(() => callbackRef.current(), delay)
		return () => clearInterval(id)
	}, [delay])
}
// #endregion

// #region RH-12 | useTimeout
/** restart переиспользует ту же логику, что и автозапуск: один источник истины. */
export type TimeoutApi = { clear: () => void; restart: () => void }
export function useTimeout(callback: () => void, delay: number | null): TimeoutApi {
	const callbackRef = useRef(callback)
	useEffect(() => {
		callbackRef.current = callback
	}, [callback])

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clear = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const restart = useCallback(() => {
		clear()
		if (delay === null) return
		timerRef.current = setTimeout(() => callbackRef.current(), delay)
	}, [clear, delay])

	useEffect(() => {
		restart()
		return clear
	}, [restart, clear])

	return { clear, restart }
}
// #endregion

// #region RH-13 | useLocalStorage
/**
 * Ленивая инициализация useState(() => ...) важна: иначе чтение из хранилища
 * и JSON.parse выполнялись бы на КАЖДОМ рендере.
 * try/catch обязателен дважды: getItem может бросить в приватном режиме,
 * а JSON.parse — на битых данных.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(() => {
		try {
			const raw = window.localStorage.getItem(key)
			return raw === null ? initial : (JSON.parse(raw) as T)
		} catch {
			return initial
		}
	})

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value))
		} catch {
			/* хранилище недоступно или переполнено — приложение падать не должно */
		}
	}, [key, value])

	const set = useCallback((next: T | ((prev: T) => T)) => {
		setValue(prev => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next))
	}, [])

	return [value, set]
}
// #endregion

// #region RH-14 | useClickOutside
/** handler в ref: смена обработчика не должна переподписывать документ. */
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void): void {
	const handlerRef = useRef(handler)
	handlerRef.current = handler

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			const element = ref.current
			if (element && !element.contains(event.target as Node)) handlerRef.current()
		}
		document.addEventListener('mousedown', onMouseDown)
		return () => document.removeEventListener('mousedown', onMouseDown)
	}, [ref])
}
// #endregion

// #region RH-15 | useEventListener
/**
 * Зависимости эффекта — только type и target. handler живёт в ref,
 * поэтому подписка создаётся один раз, а вызывается всегда свежая функция.
 */
export function useEventListener<E extends Event>(
	type: string,
	handler: (event: E) => void,
	target?: EventTarget | null
): void {
	const handlerRef = useRef(handler)
	handlerRef.current = handler

	useEffect(() => {
		const node = target ?? window
		if (!node?.addEventListener) return
		const listener = (event: Event) => handlerRef.current(event as E)
		node.addEventListener(type, listener)
		return () => node.removeEventListener(type, listener)
	}, [type, target])
}
// #endregion

// #region RH-16 | useKeyPress
/** Сравниваем event.key, а не устаревший keyCode. Для Escape это строка 'Escape'. */
export function useKeyPress(key: string, handler: (event: KeyboardEvent) => void): void {
	const handlerRef = useRef(handler)
	handlerRef.current = handler

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === key) handlerRef.current(event)
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [key])
}
// #endregion

// #region RH-17 | useMediaQuery
/**
 * Повторный setMatches внутри эффекта нужен на случай, когда запрос сменился
 * между рендером и коммитом. Старый API addListener/removeListener устарел,
 * современный — addEventListener('change').
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

	useEffect(() => {
		const list = window.matchMedia(query)
		setMatches(list.matches)
		const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
		list.addEventListener('change', onChange)
		return () => list.removeEventListener('change', onChange)
	}, [query])

	return matches
}
// #endregion

// #region RH-18 | useOnlineStatus
/** navigator.onLine говорит лишь о наличии сетевого интерфейса, а не о доступности интернета. */
export function useOnlineStatus(): boolean {
	const [online, setOnline] = useState(() => navigator.onLine)

	useEffect(() => {
		const goOnline = () => setOnline(true)
		const goOffline = () => setOnline(false)
		window.addEventListener('online', goOnline)
		window.addEventListener('offline', goOffline)
		return () => {
			window.removeEventListener('online', goOnline)
			window.removeEventListener('offline', goOffline)
		}
	}, [])

	return online
}
// #endregion

// #region RH-19 | useWindowSize
/** На проде такой обработчик обязательно троттлят: resize стреляет десятками событий в секунду. */
export function useWindowSize(): { width: number; height: number } {
	const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }))

	useEffect(() => {
		const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [])

	return size
}
// #endregion

// #region RH-20 | useSelection
/**
 * Внутри храним «сырой» набор, а наружу отдаём отфильтрованный по items —
 * так порядок не зависит от порядка кликов и не ломается при смене списка.
 */
export type SelectionApi = {
	selected: string[]
	isSelected: (id: string) => boolean
	toggle: (id: string) => void
	selectAll: () => void
	clear: () => void
	allSelected: boolean
}
export function useSelection(items: string[]): SelectionApi {
	const [raw, setRaw] = useState<string[]>([])
	const selected = items.filter(id => raw.includes(id))

	const isSelected = useCallback((id: string) => raw.includes(id), [raw])
	const toggle = useCallback(
		(id: string) => setRaw(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])),
		[]
	)
	const selectAll = useCallback(() => setRaw(items), [items])
	const clear = useCallback(() => setRaw([]), [])

	return {
		selected,
		isSelected,
		toggle,
		selectAll,
		clear,
		allSelected: items.length > 0 && selected.length === items.length,
	}
}
// #endregion

// #region RH-21 | useStateWithHistory
/**
 * История и курсор лежат в ОДНОМ объекте состояния. Два отдельных useState
 * рассинхронизируются: React применит их по очереди, и промежуточный рендер
 * увидит новый индекс со старым массивом.
 * slice(0, index + 1) обрезает «будущее» — стандартное поведение undo/redo в редакторах.
 */
export type HistoryApi<T> = {
	value: T
	set: (next: T) => void
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean
}
export function useStateWithHistory<T>(initial: T): HistoryApi<T> {
	const [state, setState] = useState<{ history: T[]; index: number }>({ history: [initial], index: 0 })

	const set = useCallback((next: T) => {
		setState(prev => {
			const history = [...prev.history.slice(0, prev.index + 1), next]
			return { history, index: history.length - 1 }
		})
	}, [])

	const undo = useCallback(() => setState(prev => ({ ...prev, index: Math.max(0, prev.index - 1) })), [])
	const redo = useCallback(
		() => setState(prev => ({ ...prev, index: Math.min(prev.history.length - 1, prev.index + 1) })),
		[]
	)

	return {
		value: state.history[state.index],
		set,
		undo,
		redo,
		canUndo: state.index > 0,
		canRedo: state.index < state.history.length - 1,
	}
}
// #endregion

// #region RH-22 | usePagination
/**
 * Зажимаем страницу и в сеттерах, и при чтении: totalItems может уменьшиться
 * после фильтрации, и тогда текущая страница окажется за границей.
 * to считается через Math.min, чтобы срез не выходил за длину данных.
 */
export type PaginationApi = {
	page: number
	totalPages: number
	next: () => void
	prev: () => void
	go: (page: number) => void
	hasNext: boolean
	hasPrev: boolean
	from: number
	to: number
}
export function usePagination(totalItems: number, perPage: number): PaginationApi {
	const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, perPage)))
	const [rawPage, setRawPage] = useState(1)
	const page = Math.min(Math.max(1, rawPage), totalPages)

	const go = useCallback((next: number) => setRawPage(Math.min(Math.max(1, next), totalPages)), [totalPages])
	const next = useCallback(() => setRawPage(p => Math.min(totalPages, p + 1)), [totalPages])
	const prev = useCallback(() => setRawPage(p => Math.max(1, p - 1)), [])

	const from = (page - 1) * perPage
	return {
		page,
		totalPages,
		next,
		prev,
		go,
		hasNext: page < totalPages,
		hasPrev: page > 1,
		from,
		to: Math.min(from + perPage, totalItems),
	}
}
// #endregion

// #region RH-23 | useAsync
/**
 * run не бросает наружу: потребитель пишет `await run()` без try/catch,
 * а ошибку читает из error. Проверка mounted перед каждым setState —
 * защита от обновления состояния размонтированного компонента.
 */
export type AsyncApi<T, A extends unknown[]> = {
	run: (...args: A) => Promise<void>
	data: T | null
	error: string | null
	loading: boolean
}
export function useAsync<T, A extends unknown[]>(fn: (...args: A) => Promise<T>): AsyncApi<T, A> {
	const [data, setData] = useState<T | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const fnRef = useRef(fn)
	fnRef.current = fn

	const mounted = useRef(true)
	useEffect(() => {
		mounted.current = true
		return () => {
			mounted.current = false
		}
	}, [])

	const run = useCallback(async (...args: A) => {
		setLoading(true)
		setError(null)
		try {
			const result = await fnRef.current(...args)
			if (!mounted.current) return
			setData(result)
		} catch (e) {
			if (!mounted.current) return
			setData(null)
			setError(e instanceof Error ? e.message : String(e))
		} finally {
			if (mounted.current) setLoading(false)
		}
	}, [])

	return { run, data, error, loading }
}
// #endregion

// #region RH-24 | useFetchJson
/**
 * Гонка: без отмены быстрый ответ на новый url может прийти РАНЬШЕ медленного на старый,
 * и старый затрёт новый. controller.abort() в cleanup закрывает и сетевой запрос, и гонку.
 * Флаг cancelled — вторая линия обороны: abort не помогает, если промис уже зарезолвился.
 * AbortError обязан молча игнорироваться, иначе пользователю мигает «ошибка» на каждый ввод.
 */
export type FetchApi<T> = { data: T | null; error: string | null; loading: boolean; reload: () => void }
export function useFetchJson<T>(url: string): FetchApi<T> {
	const [data, setData] = useState<T | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const [tick, setTick] = useState(0)

	useEffect(() => {
		const controller = new AbortController()
		let cancelled = false

		setLoading(true)
		setError(null)

		fetch(url, { signal: controller.signal })
			.then(response => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`)
				return response.json() as Promise<T>
			})
			.then(result => {
				if (cancelled) return
				setData(result)
				setLoading(false)
			})
			.catch((e: unknown) => {
				if (cancelled || (e as Error)?.name === 'AbortError') return
				setData(null)
				setError(e instanceof Error ? e.message : String(e))
				setLoading(false)
			})

		return () => {
			cancelled = true
			controller.abort()
		}
	}, [url, tick])

	const reload = useCallback(() => setTick(t => t + 1), [])
	return { data, error, loading, reload }
}
// #endregion

// #region RH-25 | useForm
/**
 * errors — ПРОИЗВОДНОЕ значение, считается при каждом рендере.
 * Хранить их в useState значит вручную синхронизировать: поменял пароль — забыл
 * пересчитать ошибку подтверждения, и кнопка соврала.
 * touched — наоборот, настоящее состояние: из values его не вывести.
 */
export type FormApi<V> = {
	values: V
	errors: Partial<Record<keyof V, string>>
	touched: Partial<Record<keyof V, boolean>>
	handleChange: (event: { target: { name: string; value: string } }) => void
	handleBlur: (event: { target: { name: string } }) => void
	handleSubmit: (onValid: (values: V) => void) => (event: { preventDefault: () => void }) => void
	isValid: boolean
	reset: () => void
}
export function useForm<V extends Record<string, string>>(
	initial: V,
	validate: (values: V) => Partial<Record<keyof V, string>>
): FormApi<V> {
	const [values, setValues] = useState<V>(initial)
	const [touched, setTouched] = useState<Partial<Record<keyof V, boolean>>>({})

	const validateRef = useRef(validate)
	validateRef.current = validate

	const errors = validate(values)
	const isValid = Object.keys(errors).length === 0

	const handleChange = useCallback((event: { target: { name: string; value: string } }) => {
		const { name, value } = event.target
		setValues(prev => ({ ...prev, [name]: value }))
	}, [])

	const handleBlur = useCallback((event: { target: { name: string } }) => {
		setTouched(prev => ({ ...prev, [event.target.name]: true }))
	}, [])

	const handleSubmit = useCallback(
		(onValid: (values: V) => void) => (event: { preventDefault: () => void }) => {
			event.preventDefault()
			setTouched(Object.fromEntries(Object.keys(values).map(key => [key, true])) as Partial<Record<keyof V, boolean>>)
			if (Object.keys(validateRef.current(values)).length === 0) onValid(values)
		},
		[values]
	)

	const reset = useCallback(() => {
		setValues(initial)
		setTouched({})
	}, [initial])

	return { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, reset }
}
// #endregion

// #region RH-26 | useCopyToClipboard
/**
 * navigator.clipboard доступен только в защищённом контексте (https или localhost)
 * и может отклониться, если у вкладки нет фокуса. Поэтому try/catch обязателен.
 */
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => Promise<void>] {
	const [copied, setCopied] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[]
	)

	const copy = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text)
				setCopied(true)
				if (timerRef.current) clearTimeout(timerRef.current)
				timerRef.current = setTimeout(() => setCopied(false), resetMs)
			} catch {
				setCopied(false)
			}
		},
		[resetMs]
	)

	return [copied, copy]
}
// #endregion
