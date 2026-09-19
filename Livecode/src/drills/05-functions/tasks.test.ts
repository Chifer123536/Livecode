import { describe, expect, it, vi } from 'vitest'
import {
	_,
	accumulate,
	arity,
	bindAll,
	chain,
	createAccount,
	createCounter,
	createCycle,
	createIdGenerator,
	createMemoFib,
	createSpy,
	createTodoModule,
	curry3,
	detach,
	flip,
	lazy,
	limitCalls,
	makeAdder,
	makeIndexFunctions,
	negate,
	partial,
	runPipeline,
	tap,
	thisQuiz,
	withLogging,
} from './tasks'

// #region FUN-01
describe('FUN-01 createCounter', () => {
	it('считает вверх и вниз', () => {
		const counter = createCounter(5)
		counter.inc()
		counter.inc()
		counter.dec()
		expect(counter.value()).toBe(6)
	})
	it('по умолчанию ноль', () => expect(createCounter().value()).toBe(0))
	it('счётчики независимы', () => {
		const a = createCounter()
		const b = createCounter()
		a.inc()
		expect(b.value()).toBe(0)
	})
	it('состояние недоступно снаружи', () => {
		const counter = createCounter(3)
		expect(Object.keys(counter).sort()).toEqual(['dec', 'inc', 'value'])
	})
})
// #endregion

// #region FUN-02
describe('FUN-02 createIdGenerator', () => {
	it('выдаёт последовательные id', () => {
		const nextId = createIdGenerator('user')
		expect(nextId()).toBe('user-1')
		expect(nextId()).toBe('user-2')
	})
	it('генераторы независимы', () => {
		const a = createIdGenerator('a')
		const b = createIdGenerator('b')
		a()
		a()
		expect(b()).toBe('b-1')
	})
})
// #endregion

// #region FUN-03
describe('FUN-03 makeAdder', () => {
	it('прибавляет зафиксированное число', () => expect(makeAdder(5)(3)).toBe(8))
	it('разные прибавлялки не мешают друг другу', () => {
		const add1 = makeAdder(1)
		const add10 = makeAdder(10)
		expect([add1(0), add10(0)]).toEqual([1, 10])
	})
})
// #endregion

// #region FUN-04
describe('FUN-04 createAccount', () => {
	it('пополнение и снятие', () => {
		const account = createAccount(100)
		expect(account.deposit(50)).toBe(true)
		expect(account.withdraw(30)).toBe(true)
		expect(account.getBalance()).toBe(120)
	})
	it('нельзя уйти в минус', () => {
		const account = createAccount(10)
		expect(account.withdraw(50)).toBe(false)
		expect(account.getBalance()).toBe(10)
	})
	it('неположительные суммы отклоняются', () => {
		const account = createAccount(10)
		expect(account.deposit(0)).toBe(false)
		expect(account.withdraw(-5)).toBe(false)
	})
	it('баланс не виден снаружи', () => {
		const account = createAccount(777)
		expect(JSON.stringify(account)).not.toContain('777')
	})
})
// #endregion

// #region FUN-05
describe('FUN-05 makeIndexFunctions', () => {
	it('каждая функция помнит свой индекс', () => {
		const fns = makeIndexFunctions(3)
		expect(fns.map(fn => fn())).toEqual([0, 1, 2])
	})
	it('ноль функций', () => expect(makeIndexFunctions(0)).toEqual([]))
})
// #endregion

// #region FUN-06
describe('FUN-06 limitCalls', () => {
	it('после лимита не выполняется', () => {
		const fn = vi.fn((n: number) => n * 2)
		const limited = limitCalls(fn, 2)
		expect([limited(1), limited(2), limited(3)]).toEqual([2, 4, 4])
		expect(fn).toHaveBeenCalledTimes(2)
	})
	it('лимит в один вызов ведёт себя как once', () => {
		const fn = vi.fn(() => 'ок')
		const limited = limitCalls(fn, 1)
		limited()
		limited()
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region FUN-07
describe('FUN-07 createCycle', () => {
	it('зацикливается', () => {
		const next = createCycle(['a', 'b'])
		expect([next(), next(), next(), next()]).toEqual(['a', 'b', 'a', 'b'])
	})
	it('один элемент', () => {
		const next = createCycle([7])
		expect([next(), next()]).toEqual([7, 7])
	})
})
// #endregion

// #region FUN-08
describe('FUN-08 partial', () => {
	it('фиксирует первые аргументы', () => {
		const greet = (greeting: string, name: string) => `${greeting}, ${name}`
		const greetHi = partial(greet as never, 'Привет')
		expect(greetHi('Аня')).toBe('Привет, Аня')
	})
	it('можно зафиксировать несколько', () => {
		const sum3 = (a: number, b: number, c: number) => a + b + c
		expect(partial(sum3 as never, 1, 2)(3)).toBe(6)
	})
})
// #endregion

// #region FUN-09
describe('FUN-09 flip', () => {
	it('меняет первые два аргумента', () => {
		const divide = (a: number, b: number) => a / b
		expect(flip(divide as never)(2, 10)).toBe(5)
	})
	it('остальные аргументы остаются на местах', () => {
		const join = (a: string, b: string, c: string) => `${a}${b}${c}`
		expect(flip(join as never)('b', 'a', 'c')).toBe('abc')
	})
})
// #endregion

// #region FUN-10
describe('FUN-10 negate', () => {
	it('инвертирует предикат', () => {
		const isOdd = negate((n: number) => n % 2 === 0)
		expect([isOdd(3), isOdd(4)]).toEqual([true, false])
	})
	it('работает в filter', () => {
		const isEven = (n: number) => n % 2 === 0
		expect([1, 2, 3, 4].filter(negate(isEven))).toEqual([1, 3])
	})
})
// #endregion

// #region FUN-11
describe('FUN-11 tap', () => {
	it('возвращает значение без изменений', () => expect(tap(5, () => {})).toBe(5))
	it('вызывает побочное действие', () => {
		const fn = vi.fn()
		tap('значение', fn)
		expect(fn).toHaveBeenCalledWith('значение')
	})
})
// #endregion

// #region FUN-12
describe('FUN-12 arity', () => {
	it('отрезает лишние аргументы', () => {
		const collect = (...args: unknown[]) => args.length
		expect(arity(collect as never, 1)(1, 2, 3)).toBe(1)
	})
	it('чинит классику с parseInt', () => {
		expect(['1', '2', '3'].map(arity(parseInt as never, 1) as (v: string) => number)).toEqual([1, 2, 3])
	})
})
// #endregion

// #region FUN-13
describe('FUN-13 createSpy', () => {
	it('помнит вызовы и результаты', () => {
		const spy = createSpy((n: number) => n * 2)
		spy.fn(2)
		spy.fn(3)
		expect(spy.calls()).toEqual([[2], [3]])
		expect(spy.results()).toEqual([4, 6])
	})
	it('возвращает результат оригинала', () => {
		const spy = createSpy((a: number, b: number) => a + b)
		expect(spy.fn(1, 2)).toBe(3)
	})
	it('наружу отдаётся копия истории', () => {
		const spy = createSpy(() => 1)
		spy.fn()
		spy.calls().push(['подделка'] as never)
		expect(spy.calls()).toHaveLength(1)
	})
})
// #endregion

// #region FUN-14
describe('FUN-14 withLogging', () => {
	it('логирует вызов и результат', () => {
		const messages: string[] = []
		function double(n: number) {
			return n * 2
		}
		const wrapped = withLogging(double, message => messages.push(message))
		expect(wrapped(4)).toBe(8)
		expect(messages).toEqual(['вызов double', 'результат 8'])
	})
})
// #endregion

// #region FUN-15
describe('FUN-15 bindAll', () => {
	it('методы не теряют this', () => {
		const obj = {
			name: 'объект',
			getName() {
				return this.name
			},
		}
		const bound = bindAll(obj)
		const loose = bound.getName
		expect(loose()).toBe('объект')
	})
	it('не-функции копируются как есть', () => {
		const bound = bindAll({ value: 42, fn: () => 1 })
		expect(bound.value).toBe(42)
	})
})
// #endregion

// #region FUN-16
describe('FUN-16 detach', () => {
	it('сохраняет контекст', () => {
		const obj = {
			name: 'объект',
			getName() {
				return this.name
			},
		}
		const read = detach(obj, 'getName') as () => string
		expect(read()).toBe('объект')
	})
	it('аргументы прокидываются', () => {
		const obj = {
			prefix: '>',
			say(text: string) {
				return `${this.prefix}${text}`
			},
		}
		const say = detach(obj, 'say') as (text: string) => string
		expect(say('привет')).toBe('>привет')
	})
})
// #endregion

// #region FUN-17
describe('FUN-17 createTodoModule', () => {
	it('добавляет и удаляет', () => {
		const todos = createTodoModule()
		todos.add('раз')
		todos.add('два')
		todos.remove('раз')
		expect(todos.list()).toEqual(['два'])
	})
	it('удаление несуществующего безопасно', () => {
		const todos = createTodoModule()
		todos.add('раз')
		todos.remove('нет такого')
		expect(todos.list()).toEqual(['раз'])
	})
	it('list отдаёт копию, приватный массив не мутируется', () => {
		const todos = createTodoModule()
		todos.add('раз')
		todos.list().push('подделка')
		expect(todos.list()).toEqual(['раз'])
	})
	it('модули независимы', () => {
		const a = createTodoModule()
		const b = createTodoModule()
		a.add('раз')
		expect(b.list()).toEqual([])
	})
})
// #endregion

// #region FUN-18
describe('FUN-18 lazy', () => {
	it('вычисляет один раз', () => {
		const factory = vi.fn(() => 'значение')
		const value = lazy(factory)
		expect(value()).toBe('значение')
		expect(value()).toBe('значение')
		expect(factory).toHaveBeenCalledTimes(1)
	})
	it('не вычисляет до первого обращения', () => {
		const factory = vi.fn(() => 1)
		lazy(factory)
		expect(factory).not.toHaveBeenCalled()
	})
	it('undefined тоже кэшируется', () => {
		const factory = vi.fn(() => undefined)
		const value = lazy(factory)
		value()
		value()
		expect(factory).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region FUN-19
describe('FUN-19 accumulate', () => {
	it('копит и отдаёт сумму', () => {
		const acc = accumulate()
		acc(1)
		acc(2)
		acc(3)
		expect(acc()).toBe(6)
	})
	it('накопители независимы', () => {
		const a = accumulate()
		const b = accumulate()
		a(5)
		expect(b()).toBe(0)
	})
})
// #endregion

// #region FUN-20
describe('FUN-20 chain', () => {
	it('склеивает вызовы', () => expect(chain(5).add(3).multiply(2).value()).toBe(16))
	it('без операций возвращает начальное', () => expect(chain(7).value()).toBe(7))
	it('ветки цепочки независимы', () => {
		const base = chain(10)
		base.add(5)
		expect(base.value()).toBe(10)
	})
})
// #endregion

// #region FUN-21
describe('FUN-21 createMemoFib', () => {
	it('считает верно', () => {
		const { fib } = createMemoFib()
		expect([fib(0), fib(1), fib(10)]).toEqual([0, 1, 55])
	})
	it('fib(35) мгновенно и без лишних вычислений', () => {
		const { fib, calls } = createMemoFib()
		expect(fib(35)).toBe(9227465)
		expect(calls()).toBeLessThanOrEqual(36)
	})
	it('повторный вызов берётся из кэша', () => {
		const { fib, calls } = createMemoFib()
		fib(20)
		const after = calls()
		fib(20)
		expect(calls()).toBe(after)
	})
})
// #endregion

// #region FUN-22
describe('FUN-22 curry3', () => {
	const join = (a: string, b: string, c: string) => `${a}${b}${c}`

	it('по одному аргументу', () => {
		const f = curry3(join as never) as (a: string) => (b: string) => (c: string) => string
		expect(f('a')('b')('c')).toBe('abc')
	})
	it('все сразу', () => {
		const f = curry3(join as never) as (...args: string[]) => string
		expect(f('a', 'b', 'c')).toBe('abc')
	})
	it('плейсхолдер заполняется позже', () => {
		const f = curry3(join as never) as (...args: unknown[]) => unknown
		const partial = f('a', _, 'c') as (b: string) => string
		expect(partial('b')).toBe('abc')
	})
	it('два плейсхолдера', () => {
		const f = curry3(join as never) as (...args: unknown[]) => unknown
		const step = f(_, 'b', _) as (...args: string[]) => string
		expect(step('a', 'c')).toBe('abc')
	})
})
// #endregion

// #region FUN-23
describe('FUN-23 runPipeline', () => {
	it('применяет шаги по очереди и собирает имена', () => {
		function double(n: number) {
			return n * 2
		}
		function addOne(n: number) {
			return n + 1
		}
		expect(runPipeline(5, [double, addOne])).toEqual({ value: 11, steps: ['double', 'addOne'] })
	})
	it('пустой список шагов', () => expect(runPipeline(3, [])).toEqual({ value: 3, steps: [] }))
})
// #endregion

// #region FUN-24
describe('FUN-24 thisQuiz', () => {
	it('предсказание верное', () => {
		expect(thisQuiz()).toEqual(['obj', 'undefined', 'other', 'bound'])
	})
	it('совпадает с реальным поведением', () => {
		const obj = {
			name: 'obj',
			regular(this: { name: string } | undefined) {
				return this?.name
			},
		}
		// Приведение снимает требование к this — ровно так функция и «отрывается» от объекта.
		const loose = obj.regular as unknown as () => string | undefined
		const real = [
			obj.regular(),
			loose(),
			obj.regular.call({ name: 'other' }),
			obj.regular.bind({ name: 'bound' })(),
		].map(value => String(value))

		expect(thisQuiz()).toEqual(real)
	})
})
// #endregion
