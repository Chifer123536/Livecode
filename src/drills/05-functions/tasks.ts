import { todo } from '../../shared/kit'

/**
 * ПРАВИЛА ПАКА
 * 1. Замыкание — это функция плюс та область видимости, в которой она была СОЗДАНА.
 *    Не «функция внутри функции», а именно сохранённая связь с переменными.
 * 2. this определяется в момент ВЫЗОВА, а не объявления. Исключение — стрелка:
 *    у неё своего this нет, она берёт его из окружающей области.
 * 3. Четыре правила this по убыванию приоритета: new → bind/call/apply → вызов по точке →
 *    всё остальное (undefined в strict, globalThis без него).
 * 4. Каждую задачу проговаривай вслух: что именно живёт в замыкании и сколько его копий.
 */

// #region FUN-01 | Счётчик с приватным состоянием | ★☆☆
/**
 * Вернуть объект { inc, dec, value }. Переменная-счётчик недоступна снаружи.
 * Два вызова createCounter дают НЕЗАВИСИМЫЕ счётчики — это ключевая проверка.
 *
 *   const c = createCounter(5); c.inc(); c.value() → 6
 */
export type Counter = { inc: () => void; dec: () => void; value: () => number }
export const createCounter = (initial?: number): Counter => todo()
// #endregion

// #region FUN-02 | Генератор идентификаторов | ★☆☆
/**
 * Каждый вызов возвращает следующий id с префиксом.
 *
 *   const nextId = createIdGenerator('user')
 *   nextId() → 'user-1', nextId() → 'user-2'
 */
export const createIdGenerator = (prefix: string): (() => string) => todo()
// #endregion

// #region FUN-03 | Прибавлялка | ★☆☆
/**
 * Классический пример замыкания.
 *
 *   const add5 = makeAdder(5); add5(3) → 8
 */
export const makeAdder = (a: number): ((b: number) => number) => todo()
// #endregion

// #region FUN-04 | Банковский счёт | ★★☆
/**
 * Баланс должен быть недоступен снаружи никак: ни через свойство, ни через Object.keys.
 *  - deposit не принимает неположительные суммы (возвращает false);
 *  - withdraw не уводит баланс в минус (возвращает false);
 *  - успешная операция возвращает true.
 *
 * Это канонический ответ на вопрос «как сделать приватное поле без классов».
 */
export type Account = {
	deposit: (amount: number) => boolean
	withdraw: (amount: number) => boolean
	getBalance: () => number
}
export const createAccount = (initial?: number): Account => todo()
// #endregion

// #region FUN-05 | Ловушка цикла | ★★☆
/**
 * Вернуть массив из n функций, где i-я функция возвращает своё i.
 *
 *   const fns = makeIndexFunctions(3)
 *   fns[0]() → 0, fns[2]() → 2
 *
 * Это тот самый пример «три раза 3», на котором проверяют понимание var и let.
 * Напиши рабочую версию, а потом ОБЪЯСНИ ВСЛУХ, почему с var она бы сломалась.
 */
export const makeIndexFunctions = (n: number): Array<() => number> => todo()
// #endregion

// #region FUN-06 | Ограничить число вызовов | ★★☆
/**
 * После max вызовов функция больше не выполняется, а возвращает последний результат.
 *
 *   const limited = limitCalls(fn, 2)
 */
export const limitCalls = <A extends unknown[], R>(fn: (...args: A) => R, max: number): ((...args: A) => R) => todo()
// #endregion

// #region FUN-07 | Циклический переключатель | ★★☆
/**
 * Каждый вызов возвращает следующее значение из списка, после последнего — снова первое.
 *
 *   const next = createCycle(['a', 'b'])
 *   next() → 'a', next() → 'b', next() → 'a'
 */
export const createCycle = <T>(values: T[]): (() => T) => todo()
// #endregion

// #region FUN-08 | Частичное применение | ★★☆
/**
 * Зафиксировать первые аргументы, остальные дописать при вызове.
 *
 *   const greetHi = partial(greet, 'Привет')
 *   greetHi('Аня') → 'Привет, Аня'
 *
 * Отличие от каррирования обязательно уметь объяснить.
 */
export const partial = <R>(
	fn: (...args: never[]) => R,
	...preset: unknown[]
): ((...rest: unknown[]) => R) => todo()
// #endregion

// #region FUN-09 | Поменять аргументы местами | ★★☆
/**
 * Развернуть первые два аргумента.
 *
 *   const divide = (a, b) => a / b
 *   flip(divide)(2, 10) → 5
 */
export const flip = <R>(fn: (...args: never[]) => R): ((...args: unknown[]) => R) => todo()
// #endregion

// #region FUN-10 | Инвертировать предикат | ★☆☆
/**
 *   const isOdd = negate((n: number) => n % 2 === 0)
 *   isOdd(3) → true
 */
export const negate = <A extends unknown[]>(
	predicate: (...args: A) => boolean
): ((...args: A) => boolean) => todo()
// #endregion

// #region FUN-11 | Подглядеть значение | ★☆☆
/**
 * Выполнить побочное действие и вернуть значение без изменений.
 * Нужен, чтобы вставить лог в середину цепочки, ничего не сломав.
 *
 *   [1, 2].map(n => tap(n, console.log))
 */
export const tap = <T>(value: T, fn: (value: T) => void): T => todo()
// #endregion

// #region FUN-12 | Ограничить арность | ★★☆
/**
 * Обрезать функцию до n аргументов, лишние отбросить.
 *
 * Практика: ['1','2','3'].map(parseInt) даёт [1, NaN, NaN],
 * потому что map передаёт индекс вторым аргументом. arity(parseInt, 1) это чинит.
 */
export const arity = <R>(fn: (...args: never[]) => R, n: number): ((...args: unknown[]) => R) => todo()
// #endregion

// #region FUN-13 | Шпион | ★★☆
/**
 * Обёртка, которая помнит все вызовы и результаты.
 * Возвращает саму функцию и доступ к истории.
 *
 *   const { fn, calls, results } = createSpy((n: number) => n * 2)
 */
export type Spy<A extends unknown[], R> = { fn: (...args: A) => R; calls: () => A[]; results: () => R[] }
export const createSpy = <A extends unknown[], R>(target: (...args: A) => R): Spy<A, R> => todo()
// #endregion

// #region FUN-14 | Логирующая обёртка | ★★☆
/**
 * Вызвать log до и после выполнения, вернуть результат оригинала.
 * Формат сообщений: `вызов fnName` и `результат <значение>`.
 * Имя функции взять из fn.name.
 */
export const withLogging = <A extends unknown[], R>(
	fn: (...args: A) => R,
	log: (message: string) => void
): ((...args: A) => R) => todo()
// #endregion

// #region FUN-15 | Привязать все методы | ★★★
/**
 * Вернуть НОВЫЙ объект, где все методы привязаны к исходному объекту.
 * После этого метод можно отдать в обработчик, не теряя this.
 *
 * Практика: до появления стрелок и классовых полей так чинили this в React-классах.
 */
export const bindAll = <T extends object>(obj: T): T => todo()
// #endregion

// #region FUN-16 | Потеря контекста | ★★☆
/**
 * Вернуть функцию, которая при вызове без контекста всё равно читает нужный объект.
 * Реализовать ДВУМЯ способами и оставить любой, но уметь назвать оба:
 * через bind и через стрелку-обёртку.
 *
 *   const read = detach(obj, 'getName')
 *   read() → значение obj.name, даже если вызвать read отдельно
 */
export const detach = <T extends object, K extends keyof T>(
	obj: T,
	method: K
): T[K] extends (...args: infer A) => infer R ? (...args: A) => R : never => todo()
// #endregion

// #region FUN-17 | Модуль на замыкании | ★★★
/**
 * Паттерн «модуль»: приватные данные и публичный интерфейс.
 * createTodoModule возвращает { add, remove, list }, где сам массив наружу не утекает:
 * list() обязан отдавать КОПИЮ, иначе снаружи можно будет мутировать приватное состояние.
 */
export type TodoModule = { add: (text: string) => void; remove: (text: string) => void; list: () => string[] }
export const createTodoModule = (): TodoModule => todo()
// #endregion

// #region FUN-18 | Ленивое значение | ★★☆
/**
 * Вычислить при первом обращении и запомнить. Повторные обращения не пересчитывают,
 * даже если результат undefined.
 *
 *   const value = lazy(() => дорогоеВычисление())
 *   value(); value()  // вычисление произошло один раз
 */
export const lazy = <T>(factory: () => T): (() => T) => todo()
// #endregion

// #region FUN-19 | Накопитель | ★★★
/**
 * Функция копит аргументы, пока её вызывают с числом, и отдаёт сумму при вызове без аргументов.
 *
 *   const acc = accumulate()
 *   acc(1); acc(2); acc(3); acc() → 6
 */
export const accumulate = (): ((n?: number) => number | undefined) => todo()
// #endregion

// #region FUN-20 | Цепочка вызовов | ★★★
/**
 * Fluent-интерфейс: методы возвращают сам объект, value() завершает цепочку.
 *
 *   chain(5).add(3).multiply(2).value() → 16
 */
export type Chain = { add: (n: number) => Chain; multiply: (n: number) => Chain; value: () => number }
export const chain = (start: number): Chain => todo()
// #endregion

// #region FUN-21 | Мемоизация рекурсии | ★★★
/**
 * Числа Фибоначчи рекурсивно, но с кэшем. Функция должна считать fib(35)
 * мгновенно и делать не больше n+1 настоящих вычислений.
 * Счётчик вызовов передаётся снаружи, чтобы тест мог его проверить.
 */
export const createMemoFib = (): { fib: (n: number) => number; calls: () => number } => todo()
// #endregion

// #region FUN-22 | Своё каррирование с плейсхолдером | ★★★
/**
 * curry(fn) даёт функцию, которую можно звать по частям.
 * Дополнительно поддержать пропуск аргумента символом _ (экспортирован ниже).
 *
 *   const f = curry3((a, b, c) => `${a}${b}${c}`)
 *   f('a', _, 'c')('b') → 'abc'
 */
export const _ = Symbol('placeholder')
export const curry3 = <R>(fn: (a: never, b: never, c: never) => R): ((...args: unknown[]) => unknown) => todo()
// #endregion

// #region FUN-23 | Композиция с общим контекстом | ★★☆
/**
 * Применить список функций к значению по очереди, собирая по пути лог шагов.
 * Возвращает { value, steps }, где steps — имена применённых функций.
 */
export type Step = (value: number) => number
export const runPipeline = (value: number, steps: Step[]): { value: number; steps: string[] } => todo()
// #endregion

// #region FUN-24 | Что вернёт this | ★★★
/**
 * Не писать код, а ПРЕДСКАЗАТЬ. Дан объект:
 *
 *   const obj = {
 *     name: 'obj',
 *     regular() { return this?.name },
 *   }
 *
 * Вернуть массив из четырёх строк — что даст каждый вызов (strict mode, ES-модуль):
 *   1) obj.regular()
 *   2) const f = obj.regular; f()
 *   3) obj.regular.call({ name: 'other' })
 *   4) obj.regular.bind({ name: 'bound' })()
 *
 * Значение undefined записывай строкой 'undefined'.
 * Подсказка к рассуждению: приоритет правил — new, затем bind/call/apply,
 * затем вызов по точке, затем всё остальное.
 */
export const thisQuiz = (): string[] => todo()
// #endregion
