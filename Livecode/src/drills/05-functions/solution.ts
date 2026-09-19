/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 05. Открывать только после своей попытки.
 */

// #region FUN-01 | Счётчик с приватным состоянием
/**
 * count живёт в области видимости createCounter. Снаружи к нему не добраться:
 * это и есть «приватное поле» до появления классовых #полей.
 * Каждый вызов createCounter создаёт НОВУЮ область, поэтому счётчики независимы.
 */
export type Counter = { inc: () => void; dec: () => void; value: () => number }

export const createCounter = (initial = 0): Counter => {
	let count = initial
	return {
		inc: () => {
			count += 1
		},
		dec: () => {
			count -= 1
		},
		value: () => count,
	}
}
// #endregion

// #region FUN-02 | Генератор идентификаторов
/** Счётчик и префикс захвачены замыканием. Разные генераторы не мешают друг другу. */
export const createIdGenerator = (prefix: string): (() => string) => {
	let id = 0
	return () => `${prefix}-${++id}`
}
// #endregion

// #region FUN-03 | Прибавлялка
/** Самый короткий пример замыкания: внутренняя функция помнит a после выхода из makeAdder. */
export const makeAdder =
	(a: number) =>
	(b: number): number =>
		a + b
// #endregion

// #region FUN-04 | Банковский счёт
/**
 * balance недоступен ни через Object.keys, ни через JSON.stringify —
 * его просто нет среди свойств возвращаемого объекта.
 * Проверки внутри методов: снаружи обойти их невозможно, в отличие от «приватности»
 * через подчёркивание в имени.
 */
export type Account = {
	deposit: (amount: number) => boolean
	withdraw: (amount: number) => boolean
	getBalance: () => number
}

export const createAccount = (initial = 0): Account => {
	let balance = initial

	return {
		deposit: (amount: number) => {
			if (amount <= 0) return false
			balance += amount
			return true
		},
		withdraw: (amount: number) => {
			if (amount <= 0 || amount > balance) return false
			balance -= amount
			return true
		},
		getBalance: () => balance,
	}
}
// #endregion

// #region FUN-05 | Ловушка цикла
/**
 * С let на каждой итерации создаётся НОВАЯ привязка i, и каждая функция замыкается
 * на свою копию. С var привязка одна на весь цикл: все функции увидят конечное значение,
 * и получится «три раза 3».
 * До появления let ту же задачу решали IIFE: (function(i){ ... })(i).
 */
export const makeIndexFunctions = (n: number): Array<() => number> => {
	const fns: Array<() => number> = []
	for (let i = 0; i < n; i++) fns.push(() => i)
	return fns
}
// #endregion

// #region FUN-06 | Ограничить число вызовов
/** Счётчик и последний результат в замыкании. Родня once, только порог больше единицы. */
export const limitCalls = <A extends unknown[], R>(fn: (...args: A) => R, max: number): ((...args: A) => R) => {
	let calls = 0
	let last: R

	return (...args: A): R => {
		if (calls < max) {
			calls += 1
			last = fn(...args)
		}
		return last
	}
}
// #endregion

// #region FUN-07 | Циклический переключатель
/** Остаток от деления даёт зацикливание без ветвлений. */
export const createCycle = <T>(values: T[]): (() => T) => {
	let index = 0
	return () => values[index++ % values.length]
}
// #endregion

// #region FUN-08 | Частичное применение
/**
 * Отличие от каррирования: partial фиксирует часть аргументов и возвращает функцию,
 * которая ждёт ВСЕ остальные разом. Каррированная функция принимает их по одному
 * и сама решает, когда пора вызывать оригинал.
 */
export const partial =
	<R>(fn: (...args: never[]) => R, ...preset: unknown[]) =>
	(...rest: unknown[]): R =>
		(fn as unknown as (...args: unknown[]) => R)(...preset, ...rest)
// #endregion

// #region FUN-09 | Поменять аргументы местами
/** Полезно для точечного переиспользования функции без переписывания её сигнатуры. */
export const flip =
	<R>(fn: (...args: never[]) => R) =>
	(...args: unknown[]): R => {
		const [first, second, ...rest] = args
		return (fn as unknown as (...a: unknown[]) => R)(second, first, ...rest)
	}
// #endregion

// #region FUN-10 | Инвертировать предикат
/** Читается лучше, чем ручное !predicate(...) в каждом месте использования. */
export const negate =
	<A extends unknown[]>(predicate: (...args: A) => boolean) =>
	(...args: A): boolean =>
		!predicate(...args)
// #endregion

// #region FUN-11 | Подглядеть значение
/** Побочный эффект есть, значение не меняется. Классический приём отладки цепочек. */
export const tap = <T>(value: T, fn: (value: T) => void): T => {
	fn(value)
	return value
}
// #endregion

// #region FUN-12 | Ограничить арность
/**
 * ['1','2','3'].map(parseInt) даёт [1, NaN, NaN]: map передаёт вторым аргументом индекс,
 * а parseInt принимает его за систему счисления. parseInt('2', 1) — недопустимое основание.
 * arity(parseInt, 1) отрезает лишнее и чинит это.
 */
export const arity =
	<R>(fn: (...args: never[]) => R, n: number) =>
	(...args: unknown[]): R =>
		(fn as unknown as (...a: unknown[]) => R)(...args.slice(0, n))
// #endregion

// #region FUN-13 | Шпион
/** История вызовов и результатов живёт в замыкании, наружу отдаются копии массивов. */
export type Spy<A extends unknown[], R> = { fn: (...args: A) => R; calls: () => A[]; results: () => R[] }

export const createSpy = <A extends unknown[], R>(target: (...args: A) => R): Spy<A, R> => {
	const calls: A[] = []
	const results: R[] = []

	return {
		fn: (...args: A): R => {
			calls.push(args)
			const result = target(...args)
			results.push(result)
			return result
		},
		calls: () => [...calls],
		results: () => [...results],
	}
}
// #endregion

// #region FUN-14 | Логирующая обёртка
/**
 * fn.name у стрелки, присвоенной переменной, берётся из имени переменной.
 * У анонимной функции в аргументе имя будет пустым — об этом стоит помнить.
 */
export const withLogging = <A extends unknown[], R>(
	fn: (...args: A) => R,
	log: (message: string) => void
): ((...args: A) => R) => {
	return (...args: A): R => {
		log(`вызов ${fn.name}`)
		const result = fn(...args)
		log(`результат ${String(result)}`)
		return result
	}
}
// #endregion

// #region FUN-15 | Привязать все методы
/**
 * bind возвращает новую функцию с намертво зафиксированным this.
 * Повторный bind уже ничего не меняет — привязку нельзя переопределить.
 * Сегодня ту же задачу решают классовые поля со стрелками.
 */
export const bindAll = <T extends object>(obj: T): T => {
	const result = {} as Record<string, unknown>

	for (const [key, value] of Object.entries(obj)) {
		result[key] = typeof value === 'function' ? value.bind(obj) : value
	}
	return result as T
}
// #endregion

// #region FUN-16 | Потеря контекста
/**
 * Два рабочих способа:
 *   obj[method].bind(obj)          — привязка навсегда;
 *   (...args) => obj[method](...args) — вызов по точке каждый раз, контекст берётся заново.
 * Второй вариант «живее»: если метод объекта подменят, обёртка вызовет новый.
 */
export const detach = <T extends object, K extends keyof T>(
	obj: T,
	method: K
): T[K] extends (...args: infer A) => infer R ? (...args: A) => R : never =>
	(obj[method] as unknown as (...args: unknown[]) => unknown).bind(obj) as never
// #endregion

// #region FUN-17 | Модуль на замыкании
/**
 * Паттерн «модуль»: массив items недоступен снаружи.
 * list() обязан возвращать КОПИЮ — иначе вызывающий получит ссылку на приватный массив
 * и сможет его мутировать, обойдя add и remove. Это типичная дыра в таком коде.
 */
export type TodoModule = { add: (text: string) => void; remove: (text: string) => void; list: () => string[] }

export const createTodoModule = (): TodoModule => {
	const items: string[] = []

	return {
		add: (text: string) => {
			items.push(text)
		},
		remove: (text: string) => {
			const index = items.indexOf(text)
			if (index !== -1) items.splice(index, 1)
		},
		list: () => [...items],
	}
}
// #endregion

// #region FUN-18 | Ленивое значение
/**
 * Флаг вместо проверки `value !== undefined`: иначе фабрика, честно вернувшая undefined,
 * будет вызываться снова и снова.
 */
export const lazy = <T>(factory: () => T): (() => T) => {
	let computed = false
	let value: T

	return () => {
		if (!computed) {
			value = factory()
			computed = true
		}
		return value
	}
}
// #endregion

// #region FUN-19 | Накопитель
/** Сумма живёт в замыкании. Вызов без аргумента — сигнал «отдавай результат». */
export const accumulate = (): ((n?: number) => number | undefined) => {
	let total = 0

	return (n?: number) => {
		if (n === undefined) return total
		total += n
		return undefined
	}
}
// #endregion

// #region FUN-20 | Цепочка вызовов
/**
 * Каждый метод возвращает объект с тем же интерфейсом, поэтому вызовы склеиваются.
 * Здесь состояние не мутируется: каждый шаг создаёт новую цепочку с новым числом.
 */
export type Chain = { add: (n: number) => Chain; multiply: (n: number) => Chain; value: () => number }

export const chain = (start: number): Chain => ({
	add: (n: number) => chain(start + n),
	multiply: (n: number) => chain(start * n),
	value: () => start,
})
// #endregion

// #region FUN-21 | Мемоизация рекурсии
/**
 * Наивная рекурсия для fib — O(2^n): fib(35) пересчитывает одни и те же значения
 * миллионы раз. Кэш превращает её в O(n), потому что каждое n считается ровно один раз.
 * Важно: рекурсивный вызов должен идти через ту же обёртку с кэшем, иначе мемоизация
 * сработает только для верхнего уровня.
 */
export const createMemoFib = (): { fib: (n: number) => number; calls: () => number } => {
	const cache = new Map<number, number>()
	let calls = 0

	const fib = (n: number): number => {
		const cached = cache.get(n)
		if (cached !== undefined) return cached

		calls += 1
		const value = n < 2 ? n : fib(n - 1) + fib(n - 2)
		cache.set(n, value)
		return value
	}

	return { fib, calls: () => calls }
}
// #endregion

// #region FUN-22 | Своё каррирование с плейсхолдером
/**
 * Накопленные аргументы живут в замыкании. Новые сначала затыкают дырки-плейсхолдеры
 * слева направо, и только потом дописываются в конец.
 * Так устроен _.curry в lodash — там плейсхолдер это сам lodash (_).
 */
export const _ = Symbol('placeholder')

export const curry3 = <R>(fn: (a: never, b: never, c: never) => R): ((...args: unknown[]) => unknown) => {
	const collect =
		(slots: unknown[]) =>
		(...args: unknown[]): unknown => {
			const next = [...slots]
			const incoming = [...args]

			for (let i = 0; i < next.length && incoming.length > 0; i++) {
				if (next[i] === _) next[i] = incoming.shift()
			}
			while (incoming.length > 0) next.push(incoming.shift())

			const filled = next.slice(0, 3)
			if (filled.length === 3 && !filled.includes(_)) {
				return (fn as unknown as (...a: unknown[]) => R)(...filled)
			}
			return collect(next)
		}

	return collect([])
}
// #endregion

// #region FUN-23 | Композиция с общим контекстом
/** fn.name даёт имя функции — удобно для логов и отладки конвейеров. */
export type Step = (value: number) => number

export const runPipeline = (value: number, steps: Step[]): { value: number; steps: string[] } => {
	const names: string[] = []
	let current = value

	for (const step of steps) {
		current = step(current)
		names.push(step.name || 'anonymous')
	}

	return { value: current, steps: names }
}
// #endregion

// #region FUN-24 | Что вернёт this
/**
 * Разбор по шагам:
 *  1) obj.regular() — вызов по точке, this это obj → 'obj'.
 *  2) f() — ссылку на функцию оторвали от объекта. В strict mode this равен undefined,
 *     поэтому this?.name даёт undefined. Без strict это был бы globalThis.
 *  3) .call({ name: 'other' }) — явная передача this побеждает точку → 'other'.
 *  4) .bind({ name: 'bound' })() — привязка зафиксирована навсегда → 'bound'.
 * Главная мысль: this определяется тем, КАК функцию вызвали, а не где объявили.
 */
export const thisQuiz = (): string[] => ['obj', 'undefined', 'other', 'bound']
// #endregion
