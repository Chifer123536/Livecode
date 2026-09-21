import type { Equal, Expect } from '../../shared/types'
import type { Post, PostWithTags } from './tasks/_types'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 22. Открывать только после своей попытки.
 */

// #region TSB-01 | Аннотации примитивов
/**
 * Шаблонная строка сама приводит number к string. Аннотация возврата : string не даёт
 * случайно вернуть число — компилятор поймает это в момент правки, а не в рантайме.
 */
export const describeUser = (name: string, age: number): string => `Имя: ${name}, возраст: ${age}`
// #endregion

// #region TSB-02 | Массив чисел
/**
 * Начальное значение 0 обязательно: без него reduce на пустом массиве бросает TypeError,
 * а тип результата становится number, а не number | undefined.
 */
export const sumAll = (list: number[]): number => list.reduce((acc, n) => acc + n, 0)
// #endregion

// #region TSB-03 | Необязательный параметр
/**
 * greeting?: string даёт тип string | undefined и заставляет проверять на undefined.
 * Значение по умолчанию убирает undefined из типа внутри функции — проверка не нужна.
 */
export const greet = (name: string, greeting: string = 'Привет'): string => `${greeting}, ${name}!`
// #endregion

// #region TSB-04 | Union и сужение через typeof
/**
 * typeof — самый простой сужатель. В ветке true компилятор знает, что id это number,
 * в ветке false остаётся string, поэтому toUpperCase доступен без приведения.
 */
export const formatId = (id: string | number): string =>
	typeof id === 'number' ? `#${id}` : id.toUpperCase()
// #endregion

// #region TSB-05 | Литеральные типы
/**
 * Литеральный union заменяет enum в 90% случаев: те же гарантии, но без рантайм-объекта
 * и без импорта. Компилятор проверяет исчерпывающесть веток.
 */
export type Direction = 'up' | 'down'

export const move = (position: number, direction: Direction): number =>
	direction === 'up' ? position + 1 : position - 1
// #endregion

// #region TSB-06 | Тип объекта
/**
 * unknown — безопасный «любой тип»: читать поля нельзя, пока не сузишь. Этим он и
 * отличается от any, который молча пропускает любое обращение и убивает проверки.
 */
export type User = { first: string; last: string }

export const fullName = (user: User): string => `${user.first} ${user.last}`

type _TSB06 = Expect<Equal<User, { first: string; last: string }>>
// #endregion

// #region TSB-07 | readonly и необязательное поле
/**
 * ?? срабатывает только на null и undefined, поэтому retries: 0 останется нулём.
 * С || ноль считался бы «пустым» и молча превратился в 3 — классический баг.
 */
export type Config = { readonly id: string; retries?: number }

export const withDefaults = (config: Config): { id: string; retries: number } => ({
	id: config.id,
	retries: config.retries ?? 3,
})
// #endregion

// #region TSB-08 | Кортеж
/**
 * [string, number] — не то же самое, что (string | number)[]: у кортежа известна позиция,
 * поэтому pair[0] это строго string, а не объединение.
 */
export const swap = (pair: [string, number]): [number, string] => [pair[1], pair[0]]
// #endregion

// #region TSB-09 | Функция как тип параметра
/**
 * Аннотация функции-параметра даёт вывод типов в колбэке на месте вызова:
 * в applyTwice(3, n => n + 1) тип n выводится автоматически, писать его не надо.
 */
export const applyTwice = (value: number, fn: (n: number) => number): number => fn(fn(value))
// #endregion

// #region TSB-10 | unknown вместо any
/**
 * Array.isArray сужает unknown до any[] — это встроенный type guard.
 * С any обе проверки были бы не нужны, но и опечатка value.lenght прошла бы молча.
 */
export const lengthOf = (value: unknown): number => {
	if (typeof value === 'string') return value.length
	if (Array.isArray(value)) return value.length
	return 0
}
// #endregion

// #region TSB-11 | Сужение через in
/**
 * Оператор in сужает union по наличию ключа. Это запасной вариант: когда типы
 * различаются полем-дискриминатором, надёжнее сравнивать его напрямую.
 */
export type Dog = { bark: () => string }
export type Cat = { meow: () => string }

export const speak = (animal: Dog | Cat): string =>
	'bark' in animal ? animal.bark() : animal.meow()
// #endregion

// #region TSB-12 | Дискриминированное объединение
/**
 * Главный приём типизации состояний. Добавишь третью фигуру — компилятор покажет все
 * места, где ветка не обработана, если возврат аннотирован и есть проверка исчерпывающести.
 */
export type Shape = { kind: 'circle'; r: number } | { kind: 'square'; side: number }

export const area = (shape: Shape): number =>
	shape.kind === 'circle' ? Math.PI * shape.r ** 2 : shape.side ** 2
// #endregion

// #region TSB-13 | Свой type guard
/**
 * Без предиката filter вернул бы unknown[]: обычный boolean компилятору ничего не говорит.
 * Предикат — обещание разработчика, компилятор его не проверяет, соврать можно.
 */
export const isString = (value: unknown): value is string => typeof value === 'string'

export const onlyStrings = (list: unknown[]): string[] => list.filter(isString)
// #endregion

// #region TSB-14 | Record и индексная сигнатура
/**
 * Явный параметр типа у reduce обязателен: иначе начальное {} выведется как {},
 * и присваивание по ключу не скомпилируется.
 */
export const countBy = (words: string[]): Record<string, number> =>
	words.reduce<Record<string, number>>((acc, word) => {
		acc[word] = (acc[word] ?? 0) + 1
		return acc
	}, {})
// #endregion

// #region TSB-15 | Union вместо enum
/**
 * Union живёт только в типах и исчезает после компиляции. enum оставляет объект в бандле
 * и у числовых enum разрешает присвоить любое число — поэтому union предпочтительнее.
 */
export type Status = 'idle' | 'loading' | 'done' | 'error'

export const isFinished = (status: Status): boolean => status === 'done' || status === 'error'
// #endregion

// #region TSB-16 | as const и вывод литералов
/**
 * as const замораживает массив и сохраняет литеральные типы элементов.
 * (typeof ROLES)[number] достаёт тип элемента — так список значений и тип не разъезжаются.
 */
export const ROLES = ['admin', 'user', 'guest'] as const
export type Role = (typeof ROLES)[number]

export const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value)

type _TSB16 = Expect<Equal<Role, 'admin' | 'user' | 'guest'>>
// #endregion

// #region TSB-17 | Первый дженерик
/**
 * Смысл дженерика не в том, чтобы не указывать тип, а в том, чтобы СВЯЗАТЬ тип входа
 * с типом выхода. T выводится из аргумента на месте вызова.
 */
export const last = <T>(list: T[]): T | undefined => list[list.length - 1]

type _TSB17 = Expect<Equal<ReturnType<typeof last<number>>, number | undefined>>
// #endregion

// #region TSB-18 | keyof и доступ по ключу
/**
 * K extends keyof T ограничивает ключ реальными полями объекта.
 * T[K] — indexed access type: точный тип значения по этому ключу, а не union всех значений.
 */
export const pluck = <T, K extends keyof T>(list: T[], key: K): T[K][] =>
	list.map(item => item[key])
// #endregion

// #region TSB-19 | Типы и async
/**
 * Аннотация : number у async-функции — ошибка компиляции: обернуть в Promise надо самому.
 * await снимает Promise ровно один слой.
 */
export const fetchLength = async (load: () => Promise<string>): Promise<number> =>
	(await load()).length
// #endregion

// #region TSB-20 | null против undefined
/**
 * find возвращает number | undefined, поэтому ?? null нужен, чтобы попасть в объявленный тип.
 * При strictNullChecks компилятор не даст забыть эту нормализацию.
 */
export const firstEven = (list: number[]): number | null => list.find(n => n % 2 === 0) ?? null
// #endregion

// #region TSB-21 | Partial
/**
 * Partial<T> вешает ? на каждое поле. Типичный кейс — объект правок в PATCH-запросе.
 */
export type Draft = Partial<Post>

type _TSB21 = Expect<Equal<Draft, { id?: number; title?: string; body?: string }>>
// #endregion

// #region TSB-22 | Pick
/**
 * Pick выбирает перечисленные поля. Ключи проверяются: опечатка в имени поля не соберётся.
 */
export type Preview = Pick<Post, 'id' | 'title'>

type _TSB22 = Expect<Equal<Preview, { id: number; title: string }>>
// #endregion

// #region TSB-23 | Omit
/**
 * Omit — обратная Pick. Осторожно: ключи у Omit НЕ проверяются на существование,
 * опечатка молча ничего не удалит.
 */
export type NewPost = Omit<Post, 'id'>

type _TSB23 = Expect<Equal<NewPost, { title: string; body: string }>>
// #endregion

// #region TSB-24 | Required
/**
 * Required снимает ? со всех полей. Обратная операция к Partial.
 */
export type FullPost = Required<PostWithTags>

type _TSB24 = Expect<Equal<FullPost, { id: number; title: string; tags: string[] }>>
// #endregion

// #region TSB-25 | Readonly
/**
 * Readonly действует на один уровень: вложенные объекты остаются изменяемыми.
 * Глубокая заморозка пишется рекурсивным mapped-типом руками.
 */
export type FrozenPost = Readonly<Post>

type _TSB25 = Expect<
	Equal<FrozenPost, { readonly id: number; readonly title: string; readonly body: string }>
>
// #endregion

// #region TSB-26 | ReturnType
/**
 * typeof берёт тип значения, ReturnType достаёт из типа функции её возврат.
 * Связка нужна постоянно: типы перестают дублировать реализацию.
 */
const makeUser = () => ({ name: 'Аня', age: 30 })

export type MadeUser = ReturnType<typeof makeUser>

type _TSB26 = Expect<Equal<MadeUser, { name: string; age: number }>>
// #endregion

// #region TSB-27 | Parameters
/**
 * Parameters возвращает кортеж аргументов, дальше берётся нужная позиция по индексу.
 * Так обёртка над чужой функцией не разъезжается с её сигнатурой.
 */
declare function send(to: string, retries: number): void

export type SendTo = Parameters<typeof send>[0]

type _TSB27 = Expect<Equal<SendTo, string>>
// #endregion

// #region TSB-28 | NonNullable
/**
 * NonNullable<T> = T & {} — исключает null и undefined.
 * Нужен после проверок, когда тип уже гарантированно заполнен, а компилятор об этом не знает.
 */
type Maybe = string | null | undefined

export type Sure = NonNullable<Maybe>

type _TSB28 = Expect<Equal<Sure, string>>
// #endregion

// #region TSB-29 | Record из union
/**
 * Record<K, V> раскладывает union ключей в объект. Добавишь роль — все объекты
 * этого типа сразу потребуют новое поле, забыть невозможно.
 */
type AppRole = 'admin' | 'user'

export type RoleFlags = Record<AppRole, boolean>

type _TSB29 = Expect<Equal<RoleFlags, { admin: boolean; user: boolean }>>
// #endregion

// #region TSB-30 | keyof
/**
 * keyof превращает объектный тип в union его ключей.
 * Основа всех дженериков вида <K extends keyof T>.
 */
export type PostKey = keyof Post

type _TSB30 = Expect<Equal<PostKey, 'id' | 'title' | 'body'>>
// #endregion
