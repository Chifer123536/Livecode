import type { Equal, Expect } from '../../shared/types'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 16. Открывать только после своей попытки.
 */

// #region TS-01 | Дженерик-функция
/**
 * T выводится из аргумента — это и есть смысл дженерика: не указать тип,
 * а СВЯЗАТЬ тип входа с типом выхода.
 * При noUncheckedIndexedAccess компилятор сам добавил бы undefined к list[0];
 * мы пишем его явно, потому что этот флаг включён не везде.
 */
export const first = <T>(list: T[]): T | undefined => list[0]
// #endregion

// #region TS-02 | Ключи объекта
/**
 * `K extends keyof T` — ключ из конкретного объекта, а не произвольная строка.
 * Возврат T[K] называется indexed access type: точный тип значения по ключу.
 */
export const getProp = <T extends object, K extends keyof T>(obj: T, key: K): T[K] => obj[key]
// #endregion

// #region TS-03 | pick с точным типом
/**
 * Object.fromEntries теряет типы (возвращает Record<string, any>), поэтому
 * собираем результат руками через reduce. Одно приведение на выходе неизбежно:
 * компилятор не умеет доказать, что мы заполнили ровно ключи K.
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
	const out = {} as Pick<T, K>
	for (const key of keys) {
		if (key in obj) out[key] = obj[key]
	}
	return out
}
// #endregion

// #region TS-04 | omit с точным типом
/** Тот же приём: фильтруем ключи, а форму результата объявляем через Omit. */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
	const out = { ...obj }
	for (const key of keys) delete out[key]
	return out
}
// #endregion

// #region TS-05 | Пользовательский type guard
/**
 * `value is string` — предикат типа. Это обещание компилятору: если функция вернула true,
 * считай аргумент строкой. Компилятор не проверяет, что внутри написана правда, —
 * ответственность на тебе, потому предикаты пишут максимально просто.
 * filter с предикатом сужает тип массива автоматически, без as.
 */
export const isString = (value: unknown): value is string => typeof value === 'string'
export const onlyStrings = (list: unknown[]): string[] => list.filter(isString)
// #endregion

// #region TS-06 | Дискриминированное объединение
/**
 * Общее литеральное поле kind — дискриминант. В каждой ветке switch тип сужается сам.
 * Трюк с never в default: если в Shape добавят четвёртую фигуру, `shape` перестанет
 * быть never, и присваивание сломает компиляцию. Это и называется exhaustiveness check —
 * забытую ветку находит компилятор, а не пользователь.
 */
export type Shape =
	| { kind: 'circle'; r: number }
	| { kind: 'rect'; w: number; h: number }
	| { kind: 'square'; size: number }

export const area = (shape: Shape): number => {
	switch (shape.kind) {
		case 'circle':
			return Math.PI * shape.r ** 2
		case 'rect':
			return shape.w * shape.h
		case 'square':
			return shape.size ** 2
		default: {
			const exhaustive: never = shape
			throw new Error(`неизвестная фигура: ${JSON.stringify(exhaustive)}`)
		}
	}
}
// #endregion

// #region TS-07 | Тип из массива через as const
/**
 * `as const` делает массив readonly-кортежем из литералов.
 * `(typeof ROLES)[number]` — индексированный доступ по числовому индексу,
 * то есть объединение всех элементов. Без as const получился бы просто string[].
 */
export const ROLES = ['admin', 'editor', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value)

type _TS07 = Expect<Equal<Role, 'admin' | 'editor' | 'viewer'>>
// #endregion

// #region TS-08 | Result вместо исключений
/**
 * Дискриминант здесь — булево поле ok. После `if (result.ok)` компилятор знает,
 * что есть value, а в else — что есть error. Это тот же приём, что и с kind.
 * Плюс подхода: ошибка видна в сигнатуре, её невозможно случайно не обработать.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T => (result.ok ? result.value : fallback)
// #endregion

// #region TS-09 | Безопасный разбор JSON
/**
 * JSON.parse возвращает any — это дыра в типизации, через неё в приложение
 * попадает что угодно. Правильный путь: принять unknown и сузить проверками.
 * `as User` вместо проверок компилируется, но падает в рантайме на первом же
 * кривом ответе бэкенда.
 */
export type User = { id: number; name: string }

export const parseUser = (raw: string): Result<User, string> => {
	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		return err('битый json')
	}

	if (typeof parsed !== 'object' || parsed === null) return err('не тот формат')
	const candidate = parsed as Record<string, unknown>
	if (typeof candidate.id !== 'number' || typeof candidate.name !== 'string') return err('не тот формат')

	return ok({ id: candidate.id, name: candidate.name })
}
// #endregion

// #region TS-10 | Перегрузки
/**
 * Видимых сигнатур две, реализация одна и наружу не торчит.
 * Поэтому len(42) не скомпилируется, хотя внутри тип шире.
 * Объединение в одной сигнатуре дало бы тот же результат проще —
 * перегрузки нужны там, где тип возврата ЗАВИСИТ от типа аргумента.
 */
export function len(value: string): number
export function len(value: unknown[]): number
export function len(value: string | unknown[]): number {
	return value.length
}
// #endregion

// #region TS-11 | Ограничение дженерика
/**
 * NumericKeys — отображённый тип с фильтром: каждое поле превращается либо в своё имя,
 * либо в never, а `[keyof T]` собирает объединение значений. never в объединении исчезает,
 * поэтому остаются только числовые ключи.
 */
export type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]

export const sumField = <T extends object, K extends NumericKeys<T>>(list: T[], key: K): number =>
	list.reduce((acc, item) => acc + Number(item[key as unknown as keyof T]), 0)
// #endregion

// #region TS-12 | Типизированный EventEmitter
/**
 * Карта событий связывает имя с типом нагрузки, поэтому emit('login', { userId: 'a' })
 * не скомпилируется. Одно приведение внутри неизбежно: хранилище общее для всех событий,
 * а типы у них разные. Важно, что приведение спрятано ВНУТРИ класса и наружу не течёт.
 */
export type EventMap = { login: { userId: number }; logout: undefined; error: string }

export class TypedEmitter<M extends Record<string, unknown>> {
	#listeners = new Map<keyof M, Set<(payload: never) => void>>()

	on<K extends keyof M>(event: K, handler: (payload: M[K]) => void): () => void {
		const set = this.#listeners.get(event) ?? new Set()
		const wrapped = handler as (payload: never) => void
		set.add(wrapped)
		this.#listeners.set(event, set)
		return () => {
			set.delete(wrapped)
		}
	}

	emit<K extends keyof M>(event: K, payload: M[K]): void {
		const set = this.#listeners.get(event)
		if (!set) return
		for (const handler of [...set]) (handler as (value: M[K]) => void)(payload)
	}
}
// #endregion

// #region TS-13 | MyPartial
/** Отображённый тип: идём по ключам и добавляем модификатор `?`. */
export type MyPartial<T> = { [K in keyof T]?: T[K] }

type _TS13 = Expect<Equal<MyPartial<{ a: number; b: string }>, { a?: number; b?: string }>>
// #endregion

// #region TS-14 | MyRequired
/** `-?` снимает необязательность. Такой же минус работает и с readonly: `-readonly`. */
export type MyRequired<T> = { [K in keyof T]-?: T[K] }

type _TS14 = Expect<Equal<MyRequired<{ a?: number; b?: string }>, { a: number; b: string }>>
// #endregion

// #region TS-15 | MyReadonly
/** Модификатор readonly навешивается в отображённом типе так же, как `?`. */
export type MyReadonly<T> = { readonly [K in keyof T]: T[K] }

type _TS15 = Expect<Equal<MyReadonly<{ a: number }>, { readonly a: number }>>
// #endregion

// #region TS-16 | MyPick
/** Идём не по keyof T, а по переданному объединению ключей. */
export type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

type _TS16 = Expect<Equal<MyPick<{ a: number; b: string; c: boolean }, 'a' | 'c'>, { a: number; c: boolean }>>
// #endregion

// #region TS-17 | MyOmit
/**
 * Omit — это Pick по остатку ключей. В стандартной библиотеке K не ограничен keyof T,
 * поэтому Omit молча проглатывает опечатку в имени ключа. Здесь ограничение есть.
 */
export type MyOmit<T, K extends keyof T> = { [P in Exclude<keyof T, K>]: T[P] }

type _TS17 = Expect<Equal<MyOmit<{ a: number; b: string; c: boolean }, 'b'>, { a: number; c: boolean }>>
// #endregion

// #region TS-18 | MyRecord
/** PropertyKey — встроенный алиас для string | number | symbol. */
export type MyRecord<K extends PropertyKey, V> = { [P in K]: V }

type _TS18 = Expect<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>
// #endregion

// #region TS-19 | MyExclude
/**
 * Условный тип с «голым» параметром слева ДИСТРИБУТИВЕН: он применяется
 * к каждому члену объединения по отдельности, а результаты снова объединяются.
 * Обернёшь параметр в квадратные скобки — [T] extends [U] — и дистрибутивность выключится.
 */
export type MyExclude<T, U> = T extends U ? never : T

type _TS19 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'b'>, 'a' | 'c'>>
// #endregion

// #region TS-20 | MyExtract
/** Зеркало Exclude: оставляем совпадения. */
export type MyExtract<T, U> = T extends U ? T : never

type _TS20 = Expect<Equal<MyExtract<'a' | 'b' | 'c', 'a' | 'c' | 'z'>, 'a' | 'c'>>
// #endregion

// #region TS-21 | MyNonNullable
/** Современный вариант короче: `T & {}`. Условный читается понятнее и учит дистрибутивности. */
export type MyNonNullable<T> = T extends null | undefined ? never : T

type _TS21 = Expect<Equal<MyNonNullable<string | null | undefined>, string>>
// #endregion

// #region TS-22 | MyReturnType
/**
 * `infer R` объявляет переменную типа прямо в условии: «если F похож на функцию,
 * назови её тип возврата R». `never[]` в параметрах вместо `any[]` — из-за
 * контравариантности параметров подходит любая функция.
 */
export type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never

type _TS22 = Expect<Equal<MyReturnType<() => number>, number>>
type _TS22b = Expect<Equal<MyReturnType<(a: string) => string[]>, string[]>>
// #endregion

// #region TS-23 | MyParameters
/** infer по списку параметров даёт кортеж — вместе с именами аргументов. */
export type MyParameters<F> = F extends (...args: infer P) => unknown ? P : never

type _TS23 = Expect<Equal<MyParameters<(a: number, b: string) => void>, [a: number, b: string]>>
// #endregion

// #region TS-24 | UnwrapPromise
/** Рекурсия по условному типу. Ровно так устроен встроенный Awaited<T>. */
export type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T

type _TS24 = Expect<Equal<UnwrapPromise<Promise<string>>, string>>
type _TS24b = Expect<Equal<UnwrapPromise<Promise<Promise<number>>>, number>>
type _TS24c = Expect<Equal<UnwrapPromise<boolean>, boolean>>
// #endregion

// #region TS-25 | DeepReadonly
/**
 * Осторожно: `extends object` истинно и для функций, и для массивов.
 * В продовой версии функции обычно исключают отдельной веткой.
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] }

type _TS25 = Expect<
	Equal<DeepReadonly<{ a: number; b: { c: string } }>, { readonly a: number; readonly b: { readonly c: string } }>
>
// #endregion

// #region TS-26 | KeysOfType
/**
 * Тот же приём «отображение с фильтром», что и в NumericKeys.
 * `-?` нужен, чтобы необязательные поля не превращались в `K | undefined`.
 */
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]

type _TS26 = Expect<Equal<KeysOfType<{ a: number; b: string; c: number }, number>, 'a' | 'c'>>
// #endregion
