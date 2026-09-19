import { todo } from '../../shared/kit'
import type { Equal, Expect } from '../../shared/types'

/**
 * ПРАВИЛА ПАКА
 * 1. Задачи 01-12 проверяются обычными тестами: `yarn t`.
 * 2. Задачи 13-26 — чистые типы. Их проверяет компилятор: `yarn typecheck`.
 *    Строки вида `type _TS13 = Expect<Equal<...>>` — это и есть тесты. НЕ УДАЛЯЙ их:
 *    пока тип написан неверно, строка подсвечена красным прямо в редакторе.
 * 3. `any` запрещён во всём паке. Если не знаешь тип — это `unknown` плюс сужение.
 * 4. `as` — крайняя мера. Сначала type guard, потом уже приведение.
 */

// #region TS-01 | Дженерик-функция | ★☆☆
/**
 * Вернуть первый элемент массива или undefined для пустого.
 * Типизировать так, чтобы first([1,2]) имел тип number | undefined,
 * а first(['a']) — string | undefined. Без any и без перегрузок.
 */
export const first = <T>(list: T[]): T | undefined => todo()
// #endregion

// #region TS-02 | Ключи объекта | ★★☆
/**
 * Достать значение по ключу так, чтобы тип результата был точным,
 * а несуществующий ключ не компилировался.
 *
 *   getProp({ a: 1, b: 'x' }, 'b') → тип string
 */
export const getProp = <T extends object, K extends keyof T>(obj: T, key: K): T[K] => todo()
// #endregion

// #region TS-03 | pick с точным типом | ★★☆
/**
 * Взять подмножество ключей. Тип результата — Pick<T, K>, а не общий объект.
 *
 *   pick({ a: 1, b: 'x', c: true }, ['a', 'c']) → { a: number; c: boolean }
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => todo()
// #endregion

// #region TS-04 | omit с точным типом | ★★☆
/**
 * Выкинуть ключи. Тип результата — Omit<T, K>.
 *
 *   omit({ a: 1, b: 'x' }, ['b']) → { a: number }
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => todo()
// #endregion

// #region TS-05 | Пользовательский type guard | ★★☆
/**
 * isString — предикат типа: сигнатура `value is string`.
 * onlyStrings использует его так, чтобы результат имел тип string[] БЕЗ приведения.
 *
 *   onlyStrings([1, 'a', null, 'b']) → ['a', 'b'] типа string[]
 */
export const isString = (value: unknown): value is string => todo()
export const onlyStrings = (list: unknown[]): string[] => todo()
// #endregion

// #region TS-06 | Дискриминированное объединение | ★★★
/**
 * Посчитать площадь фигуры. Сужение по полю kind, без as и без any.
 * Ветку default написать через `never`, чтобы добавление новой фигуры
 * ЛОМАЛО компиляцию, а не молча возвращало ноль.
 *
 *   area({ kind: 'circle', r: 2 })            → 12.566...
 *   area({ kind: 'rect', w: 2, h: 3 })        → 6
 *   area({ kind: 'square', size: 3 })         → 9
 */
export type Shape =
	| { kind: 'circle'; r: number }
	| { kind: 'rect'; w: number; h: number }
	| { kind: 'square'; size: number }

export const area = (shape: Shape): number => todo()
// #endregion

// #region TS-07 | Тип из массива через as const | ★★☆
/**
 * ROLES объявлен как константа. Объяви тип Role так, чтобы он был
 * 'admin' | 'editor' | 'viewer', а не string.
 * isRole — предикат, проверяющий принадлежность строки к ROLES.
 */
export const ROLES = ['admin', 'editor', 'viewer'] as const
export type Role = string // ← замени на правильный тип
export const isRole = (value: string): value is Role => todo()

type _TS07 = Expect<Equal<Role, 'admin' | 'editor' | 'viewer'>>
// #endregion

// #region TS-08 | Result вместо исключений | ★★★
/**
 * Тип Result<T, E> — дискриминированное объединение успеха и ошибки.
 * ok(value) и err(error) — конструкторы, unwrapOr(result, fallback) — безопасное чтение.
 * После проверки result.ok === true поле value должно сужаться без приведения.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => todo()
export const err = <E>(error: E): Result<never, E> => todo()
export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T => todo()
// #endregion

// #region TS-09 | Безопасный разбор JSON | ★★★
/**
 * Распарсить строку и проверить, что это объект с нужной формой.
 * Возвращает Result<User, string>. Никаких `as User` — только проверки.
 * Ошибки: 'битый json' при исключении парсинга, 'не тот формат' при несовпадении формы.
 */
export type User = { id: number; name: string }
export const parseUser = (raw: string): Result<User, string> => todo()
// #endregion

// #region TS-10 | Перегрузки | ★★★
/**
 * len(value) возвращает длину строки или массива.
 * Написать ДВЕ перегрузки, чтобы len('abc') и len([1,2]) оба давали number,
 * а len(42) не компилировался.
 */
export function len(value: string): number
export function len(value: unknown[]): number
export function len(value: string | unknown[]): number {
	return todo()
}
// #endregion

// #region TS-11 | Ограничение дженерика | ★★☆
/**
 * Сумма по числовому полю. Типизировать так, чтобы ключ можно было передать
 * ТОЛЬКО если значение по нему — число.
 *
 *   sumField([{ price: 10 }, { price: 5 }], 'price')  → 15
 *   sumField([{ title: 'a' }], 'title')               → ошибка компиляции
 */
export type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
export const sumField = <T extends object, K extends NumericKeys<T>>(list: T[], key: K): number => todo()
// #endregion

// #region TS-12 | Типизированный EventEmitter | ★★★
/**
 * Карта событий задаёт имя → тип полезной нагрузки.
 * on и emit должны требовать полезную нагрузку ровно того типа,
 * который объявлен для этого события.
 *
 *   emitter.emit('login', { userId: 1 })   ок
 *   emitter.emit('login', { userId: 'a' }) ошибка компиляции
 */
export type EventMap = { login: { userId: number }; logout: undefined; error: string }

export class TypedEmitter<M extends Record<string, unknown>> {
	on<K extends keyof M>(event: K, handler: (payload: M[K]) => void): () => void {
		return todo()
	}
	emit<K extends keyof M>(event: K, payload: M[K]): void {
		return todo()
	}
}
// #endregion

// #region TS-13 | MyPartial | ★★☆
/** Аналог Partial<T>: все поля становятся необязательными. */
export type MyPartial<T> = T

type _TS13 = Expect<Equal<MyPartial<{ a: number; b: string }>, { a?: number; b?: string }>>
// #endregion

// #region TS-14 | MyRequired | ★★☆
/** Аналог Required<T>: снять все знаки вопроса. Модификатор снимается через `-?`. */
export type MyRequired<T> = T

type _TS14 = Expect<Equal<MyRequired<{ a?: number; b?: string }>, { a: number; b: string }>>
// #endregion

// #region TS-15 | MyReadonly | ★★☆
/** Аналог Readonly<T>. */
export type MyReadonly<T> = T

type _TS15 = Expect<Equal<MyReadonly<{ a: number }>, { readonly a: number }>>
// #endregion

// #region TS-16 | MyPick | ★★☆
/** Аналог Pick<T, K>. Ключи ограничить через `K extends keyof T`. */
export type MyPick<T, K> = T

type _TS16 = Expect<Equal<MyPick<{ a: number; b: string; c: boolean }, 'a' | 'c'>, { a: number; c: boolean }>>
// #endregion

// #region TS-17 | MyOmit | ★★★
/** Аналог Omit<T, K>. Подсказка: Pick + Exclude по keyof. */
export type MyOmit<T, K> = T

type _TS17 = Expect<Equal<MyOmit<{ a: number; b: string; c: boolean }, 'b'>, { a: number; c: boolean }>>
// #endregion

// #region TS-18 | MyRecord | ★★☆
/** Аналог Record<K, V>. Ключи ограничить через `K extends string | number | symbol`. */
export type MyRecord<K, V> = K

type _TS18 = Expect<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>
// #endregion

// #region TS-19 | MyExclude | ★★☆
/**
 * Аналог Exclude<T, U>: выкинуть из объединения всё, что присваиваемо U.
 * Работает за счёт дистрибутивности условных типов по «голому» параметру.
 */
export type MyExclude<T, U> = T

type _TS19 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'b'>, 'a' | 'c'>>
// #endregion

// #region TS-20 | MyExtract | ★★☆
/** Аналог Extract<T, U>: оставить только присваиваемое U. */
export type MyExtract<T, U> = T

type _TS20 = Expect<Equal<MyExtract<'a' | 'b' | 'c', 'a' | 'c' | 'z'>, 'a' | 'c'>>
// #endregion

// #region TS-21 | MyNonNullable | ★★☆
/** Аналог NonNullable<T>: убрать null и undefined. */
export type MyNonNullable<T> = T

type _TS21 = Expect<Equal<MyNonNullable<string | null | undefined>, string>>
// #endregion

// #region TS-22 | MyReturnType | ★★★
/** Аналог ReturnType<F>. Подсказка: условный тип с `infer R`. */
export type MyReturnType<F> = F

type _TS22 = Expect<Equal<MyReturnType<() => number>, number>>
type _TS22b = Expect<Equal<MyReturnType<(a: string) => string[]>, string[]>>
// #endregion

// #region TS-23 | MyParameters | ★★★
/** Аналог Parameters<F>: кортеж аргументов. Снова `infer`, но уже по списку параметров. */
export type MyParameters<F> = F

type _TS23 = Expect<Equal<MyParameters<(a: number, b: string) => void>, [a: number, b: string]>>
// #endregion

// #region TS-24 | UnwrapPromise | ★★★
/**
 * Развернуть Promise. Непромис вернуть как есть, вложенные промисы разворачивать рекурсивно.
 */
export type UnwrapPromise<T> = T

type _TS24 = Expect<Equal<UnwrapPromise<Promise<string>>, string>>
type _TS24b = Expect<Equal<UnwrapPromise<Promise<Promise<number>>>, number>>
type _TS24c = Expect<Equal<UnwrapPromise<boolean>, boolean>>
// #endregion

// #region TS-25 | DeepReadonly | ★★★
/** Рекурсивный Readonly: заморозить объект на всех уровнях вложенности. */
export type DeepReadonly<T> = T

type _TS25 = Expect<
	Equal<DeepReadonly<{ a: number; b: { c: string } }>, { readonly a: number; readonly b: { readonly c: string } }>
>
// #endregion

// #region TS-26 | KeysOfType | ★★★
/**
 * Ключи, у которых значение имеет тип V.
 * Приём — «отображение с фильтром»: в отображённом типе положить K или never, затем взять [keyof T].
 */
export type KeysOfType<T, V> = keyof T

type _TS26 = Expect<Equal<KeysOfType<{ a: number; b: string; c: number }, number>, 'a' | 'c'>>
// #endregion
