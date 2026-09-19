/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 06. Открывать только после своей попытки.
 */

// #region ASY-01 | Задержка
/** resolve передаётся в setTimeout напрямую: лишняя стрелка ничего не добавляет. */
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))
// #endregion

// #region ASY-02 | Значение через задержку
/** Здесь стрелка уже нужна — иначе setTimeout передаст в resolve свой аргумент. */
export const delayValue = <T>(value: T, ms: number): Promise<T> =>
	new Promise(resolve => setTimeout(() => resolve(value), ms))
// #endregion

// #region ASY-03 | Последовательный запуск
/**
 * for..of с await внутри — единственный простой способ получить ОЧЕРЕДЬ.
 * tasks.map(async ...) запустил бы всё сразу: map не ждёт, он лишь собирает промисы.
 */
export const sequential = async <T>(tasks: Array<() => Promise<T>>): Promise<T[]> => {
	const results: T[] = []
	for (const task of tasks) results.push(await task())
	return results
}
// #endregion

// #region ASY-04 | Параллельный запуск
/**
 * Вызов task() СРАЗУ запускает работу, Promise.all только ждёт.
 * Первый reject отклоняет всё, но остальные задачи при этом продолжают выполняться —
 * отменить их Promise.all не умеет.
 */
export const parallel = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> => Promise.all(tasks.map(task => task()))
// #endregion

// #region ASY-05 | Свой Promise.all
/**
 * Результат кладём по ИНДЕКСУ, а не push: промисы завершаются вразнобой,
 * и push перемешал бы порядок. Счётчик done нужен потому, что проверка
 * results.length не сработает — массив заранее нужной длины.
 * Пустой вход обязан резолвиться сразу, иначе промис зависнет навсегда.
 */
export const myAll = <T>(promises: Array<Promise<T>>): Promise<T[]> =>
	new Promise((resolve, reject) => {
		if (promises.length === 0) return resolve([])
		const results = new Array<T>(promises.length)
		let done = 0

		promises.forEach((promise, index) => {
			Promise.resolve(promise).then(value => {
				results[index] = value
				done += 1
				if (done === promises.length) resolve(results)
			}, reject)
		})
	})
// #endregion

// #region ASY-06 | Свой Promise.allSettled
/**
 * Отклонений наружу нет вообще: каждый промис оборачивается в объект статуса.
 * Применяется там, где частичный успех лучше, чем полный провал:
 * загрузили 8 из 10 виджетов — показываем 8.
 */
export type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }

export const myAllSettled = <T>(promises: Array<Promise<T>>): Promise<Array<Settled<T>>> =>
	Promise.all(
		promises.map(promise =>
			Promise.resolve(promise).then(
				(value): Settled<T> => ({ status: 'fulfilled', value }),
				(reason): Settled<T> => ({ status: 'rejected', reason })
			)
		)
	)
// #endregion

// #region ASY-07 | Свой Promise.race
/**
 * Промис можно резолвить только один раз — повторные вызовы игнорируются.
 * Поэтому достаточно подписать resolve и reject на все промисы, без флагов.
 * Важно: проигравшие продолжают работать. race не отменяет, он перестаёт ждать.
 */
export const myRace = <T>(promises: Array<Promise<T>>): Promise<T> =>
	new Promise((resolve, reject) => {
		for (const promise of promises) Promise.resolve(promise).then(resolve, reject)
	})
// #endregion

// #region ASY-08 | Свой Promise.any
/**
 * Зеркало race по смыслу: ждём первый УСПЕХ, ошибки копим.
 * Штатный Promise.any отклоняется объектом AggregateError со всеми причинами.
 */
export const myAny = <T>(promises: Array<Promise<T>>): Promise<T> =>
	new Promise((resolve, reject) => {
		if (promises.length === 0) return reject(new Error('все промисы упали'))
		let failed = 0

		for (const promise of promises) {
			Promise.resolve(promise).then(resolve, () => {
				failed += 1
				if (failed === promises.length) reject(new Error('все промисы упали'))
			})
		}
	})
// #endregion

// #region ASY-09 | Ограничение параллелизма
/**
 * Схема «воркеры и общий курсор»: запускаем limit параллельных циклов,
 * каждый берёт следующий свободный индекс. Так очередь разгребается
 * ровно с нужной плотностью, без пауз между задачами.
 * Запись по индексу обязательна — иначе порядок результатов поедет.
 */
export const mapLimit = async <T, R>(
	items: T[],
	limit: number,
	fn: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
	const results = new Array<R>(items.length)
	let cursor = 0

	const worker = async (): Promise<void> => {
		while (cursor < items.length) {
			const index = cursor++
			results[index] = await fn(items[index], index)
		}
	}

	const workers = Math.max(1, Math.min(limit, items.length))
	await Promise.all(Array.from({ length: workers }, () => worker()))
	return results
}
// #endregion

// #region ASY-10 | Повтор при ошибке
/**
 * Цикл с try/catch. На последней попытке ошибку пробрасываем, а не глотаем.
 * Частая ошибка — ретраить всё подряд: повторять имеет смысл только сетевые сбои
 * и 5xx, а 400 или 403 повторять бессмысленно.
 */
export const retry = async <T>(fn: () => Promise<T>, attempts: number, delayMs = 0): Promise<T> => {
	let lastError: unknown

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error
			if (attempt < attempts && delayMs > 0) await delay(delayMs)
		}
	}
	throw lastError
}
// #endregion

// #region ASY-11 | Повтор с ростом паузы
/**
 * Экспоненциальная задержка: base, base*2, base*4. На проде к ней добавляют
 * случайный разброс (jitter), иначе все клиенты, упавшие одновременно,
 * одновременно же и вернутся, и добьют сервер повторно.
 */
export const retryBackoff = async <T>(
	fn: () => Promise<T>,
	attempts: number,
	base: number,
	onAttempt?: (waitMs: number) => void
): Promise<T> => {
	let wait = base
	let lastError: unknown

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error
			if (attempt === attempts) break
			onAttempt?.(wait)
			await delay(wait)
			wait *= 2
		}
	}
	throw lastError
}
// #endregion

// #region ASY-12 | Таймаут
/**
 * race с промисом-будильником. Таймер снимаем в finally, иначе он продержит
 * процесс живым до срабатывания (в Node это видно сразу).
 * Помни: исходный промис продолжает выполняться. Настоящая отмена — AbortController.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
	let timer: ReturnType<typeof setTimeout> | undefined

	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(new Error('timeout')), ms)
	})

	return Promise.race([promise, timeout]).finally(() => {
		if (timer) clearTimeout(timer)
	})
}
// #endregion

// #region ASY-13 | Отмена через AbortController
/**
 * Три обязательные части: проверка signal.aborted ДО старта (сигнал мог сработать раньше),
 * снятие слушателя при нормальном завершении и очистка таймера при отмене.
 * Имя ошибки 'AbortError' — соглашение: по нему отличают отмену от настоящего сбоя.
 */
export const cancellableDelay = (ms: number, signal: AbortSignal): Promise<void> =>
	new Promise((resolve, reject) => {
		const abortError = () => {
			const error = new Error('Aborted')
			error.name = 'AbortError'
			return error
		}

		if (signal.aborted) return reject(abortError())

		const onAbort = () => {
			clearTimeout(timer)
			reject(abortError())
		}

		const timer = setTimeout(() => {
			signal.removeEventListener('abort', onAbort)
			resolve()
		}, ms)

		signal.addEventListener('abort', onAbort, { once: true })
	})
// #endregion

// #region ASY-14 | Первый непустой ответ
/**
 * Последовательный обход с проглатыванием ошибок: упавший источник просто пропускаем.
 * Параллельный запуск здесь был бы ошибкой — смысл в том, чтобы не дёргать базу,
 * если ответил кэш.
 */
export const firstNonEmpty = async <T>(sources: Array<() => Promise<T | null>>): Promise<T | null> => {
	for (const source of sources) {
		try {
			const value = await source()
			if (value !== null && value !== undefined) return value
		} catch {
			/* источник недоступен — ведём себя так, будто он ответил пусто */
		}
	}
	return null
}
// #endregion

// #region ASY-15 | Дедупликация одинаковых запросов
/**
 * Карта «ключ → промис в полёте». Второй вызов получает ТОТ ЖЕ промис,
 * а не новый запрос. Запись убирается в finally, иначе ошибка залипнет навсегда.
 * Именно так устроен дедуп в SWR и TanStack Query.
 */
export const dedupe = <A extends string, R>(fn: (key: A) => Promise<R>): ((key: A) => Promise<R>) => {
	const inflight = new Map<A, Promise<R>>()

	return (key: A) => {
		const existing = inflight.get(key)
		if (existing) return existing

		const promise = fn(key).finally(() => {
			inflight.delete(key)
		})
		inflight.set(key, promise)
		return promise
	}
}
// #endregion

// #region ASY-16 | Кэш с временем жизни
/**
 * Кэшируем сам ПРОМИС, а не результат: тогда параллельные вызовы до первого ответа
 * тоже схлопываются. Ошибку из кэша выбрасываем — иначе одна сетевая неудача
 * будет отдаваться пользователю весь ttl.
 */
export const cached = <A extends string, R>(fn: (key: A) => Promise<R>, ttl: number): ((key: A) => Promise<R>) => {
	const store = new Map<A, { promise: Promise<R>; expiresAt: number }>()

	return (key: A) => {
		const hit = store.get(key)
		if (hit && hit.expiresAt > Date.now()) return hit.promise

		const promise = fn(key)
		store.set(key, { promise, expiresAt: Date.now() + ttl })
		promise.catch(() => store.delete(key))
		return promise
	}
}
// #endregion

// #region ASY-17 | Очередь задач
/**
 * Хвост — это промис последней добавленной задачи. Новая цепляется через then
 * с ОБОИМИ обработчиками, поэтому упавшая задача не рвёт очередь.
 * Наружу отдаём промис самой задачи, а в хвост кладём его «обезвреженную» версию.
 */
export type Queue = { add: <T>(task: () => Promise<T>) => Promise<T>; size: () => number }

export const createQueue = (): Queue => {
	let tail: Promise<unknown> = Promise.resolve()
	let pending = 0

	return {
		add<T>(task: () => Promise<T>): Promise<T> {
			pending += 1
			const result = tail.then(task, task)
			const settled = result.then(
				() => undefined,
				() => undefined
			)
			settled.then(() => {
				pending -= 1
			})
			tail = settled
			return result
		},
		size: () => pending,
	}
}
// #endregion

// #region ASY-18 | Промисификация колбэка
/**
 * Обёртка над колбэком в стиле Node: первым аргументом ошибка.
 * В самом Node есть util.promisify, но написать руками просят регулярно —
 * это проверка, понимаешь ли ты, что промис это просто обёртка над колбэком.
 */
export type NodeStyle<T> = (arg: string, callback: (error: Error | null, result?: T) => void) => void

export const promisify =
	<T>(fn: NodeStyle<T>) =>
	(arg: string): Promise<T> =>
		new Promise<T>((resolve, reject) => {
			fn(arg, (error, result) => {
				if (error) reject(error)
				else resolve(result as T)
			})
		})
// #endregion

// #region ASY-19 | Безопасный вызов
/**
 * Приём из Go: ошибка становится обычным значением, а не управляющей конструкцией.
 * Убирает лестницу вложенных try/catch, когда в функции пять последовательных запросов.
 */
export const safe = <T>(promise: Promise<T>): Promise<[Error | null, T | null]> =>
	promise.then(
		(data): [null, T] => [null, data],
		(error: unknown): [Error, null] => [error instanceof Error ? error : new Error(String(error)), null]
	)
// #endregion

// #region ASY-20 | Последовательная свёртка
/**
 * Обычный reduce с промисами не работает так, как ожидается: аккумулятором станет промис.
 * Поэтому пишем цикл — каждый шаг честно ждёт предыдущий.
 */
export const reduceAsync = async <T, A>(
	items: T[],
	fn: (acc: A, item: T, index: number) => Promise<A>,
	initial: A
): Promise<A> => {
	let acc = initial
	for (let index = 0; index < items.length; index++) acc = await fn(acc, items[index], index)
	return acc
}
// #endregion

// #region ASY-21 | Асинхронный фильтр
/**
 * Сначала параллельно считаем все флаги, потом фильтруем синхронно.
 * items.filter(async ...) НЕ работает: предикат вернёт промис, а промис всегда истинный,
 * поэтому такой фильтр молча пропустит вообще всё. Классическая ловушка.
 */
export const filterAsync = async <T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<T[]> => {
	const flags = await Promise.all(items.map(item => predicate(item)))
	return items.filter((_, index) => flags[index])
}
// #endregion

// #region ASY-22 | Опрос до условия
/**
 * Пауза ставится только МЕЖДУ попытками: лишний sleep в конце задержал бы ответ.
 * На проде интервал обычно тоже растёт, чтобы не долбить сервер ровным потоком.
 */
export const poll = async <T>(
	fn: () => Promise<T>,
	condition: (value: T) => boolean,
	intervalMs: number,
	maxAttempts: number
): Promise<T> => {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const value = await fn()
		if (condition(value)) return value
		if (attempt < maxAttempts) await delay(intervalMs)
	}
	throw new Error('опрос не дождался')
}
// #endregion

// #region ASY-23 | Отменяемая обёртка
/**
 * Отменить настоящий промис нельзя — он уже запущен. Можно лишь перестать
 * реагировать на его результат. Обёртка после cancel() не резолвится и не отклоняется,
 * то есть просто выпадает из цепочки.
 * До AbortController именно так чинили «setState после размонтирования» в React.
 */
export type Cancellable<T> = { promise: Promise<T>; cancel: () => void }

export const makeCancellable = <T>(promise: Promise<T>): Cancellable<T> => {
	let cancelled = false

	const wrapped = new Promise<T>((resolve, reject) => {
		promise.then(
			value => {
				if (!cancelled) resolve(value)
			},
			error => {
				if (!cancelled) reject(error)
			}
		)
	})

	return {
		promise: wrapped,
		cancel: () => {
			cancelled = true
		},
	}
}
// #endregion

// #region ASY-24 | Гонка запросов
/**
 * Счётчик-токен: каждый вызов запоминает свой номер, а при завершении сверяет его
 * с последним выданным. Не совпало — значит пока мы ждали, запустили новый вызов,
 * и наш результат уже неактуален.
 * Ровно эта ошибка даёт «в поиске показались результаты от предыдущего запроса».
 */
export const latestOnly = <A extends unknown[], R>(
	fn: (...args: A) => Promise<R>
): ((...args: A) => Promise<R | undefined>) => {
	let token = 0

	return async (...args: A) => {
		const current = ++token
		const result = await fn(...args)
		return current === token ? result : undefined
	}
}
// #endregion

// #region ASY-25 | Пакетирование вызовов
/**
 * Копим ключи в буфер и через windowMs отправляем одним запросом.
 * Результаты раздаём ПО ПОЗИЦИИ — поэтому loader обязан вернуть массив
 * той же длины и в том же порядке.
 * Так устроен DataLoader: он убирает проблему N+1 запросов.
 */
export const batched = <K, R>(loader: (keys: K[]) => Promise<R[]>, windowMs: number): ((key: K) => Promise<R>) => {
	let keys: K[] = []
	let waiters: Array<{ resolve: (value: R) => void; reject: (error: unknown) => void }> = []
	let timer: ReturnType<typeof setTimeout> | null = null

	const flush = () => {
		const batchKeys = keys
		const batchWaiters = waiters
		keys = []
		waiters = []
		timer = null

		loader(batchKeys).then(
			results => batchWaiters.forEach((waiter, index) => waiter.resolve(results[index])),
			error => batchWaiters.forEach(waiter => waiter.reject(error))
		)
	}

	return (key: K) =>
		new Promise<R>((resolve, reject) => {
			keys.push(key)
			waiters.push({ resolve, reject })
			if (!timer) timer = setTimeout(flush, windowMs)
		})
}
// #endregion

// #region ASY-26 | Порядок Event Loop
/**
 * Рассуждение по шагам:
 *  1. Синхронный код выполняется целиком: '1', затем '5'.
 *  2. Стек опустел — разбирается очередь МИКРОЗАДАЧ, целиком, в порядке постановки.
 *     .then был поставлен раньше queueMicrotask, значит '3', потом '4'.
 *  3. Только теперь берётся одна МАКРОЗАДАЧА: '2' из setTimeout.
 * Правило на собес: микрозадачи всегда обгоняют макрозадачи, даже при setTimeout(…, 0).
 */
export const eventLoopOrder = (): string[] => ['1', '5', '3', '4', '2']
// #endregion
