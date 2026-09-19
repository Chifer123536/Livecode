import { describe, expect, it, vi } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	compose,
	createStore,
	curry,
	cx,
	debounce,
	deepClone,
	deepEqual,
	deepFreeze,
	deepMerge,
	EventEmitter,
	flattenObject,
	get,
	groupByPath,
	LRUCache,
	memoize,
	memoizeByRef,
	myBind,
	myCall,
	myInstanceOf,
	once,
	pipe,
	rateLimiter,
	set,
	throttle,
	throttleTrailing,
} from './tasks'

// #region UTL-01
describe('UTL-01 debounce', () => {
	it('три быстрых вызова дают один запуск', async () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 30)
		debounced()
		debounced()
		debounced()
		expect(fn).not.toHaveBeenCalled()
		await sleep(60)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('таймер перезапускается на каждом вызове', async () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 40)
		debounced()
		await sleep(25)
		debounced()
		await sleep(25)
		expect(fn).not.toHaveBeenCalled()
		await sleep(30)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('аргументы берутся от последнего вызова', async () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 20)
		debounced(1)
		debounced(2)
		debounced(3)
		await sleep(50)
		expect(fn).toHaveBeenCalledWith(3)
	})

	it('this не теряется', async () => {
		const obj = {
			count: 0,
			bump: debounce(function (this: { count: number }) {
				this.count += 1
			}, 20),
		}
		obj.bump()
		await sleep(50)
		expect(obj.count).toBe(1)
	})

	it('cancel отменяет запланированный вызов', async () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 20)
		debounced()
		debounced.cancel()
		await sleep(50)
		expect(fn).not.toHaveBeenCalled()
	})
})
// #endregion

// #region UTL-02
describe('UTL-02 throttle', () => {
	it('первый вызов проходит сразу', () => {
		const fn = vi.fn()
		throttle(fn, 100)()
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('вызовы внутри окна отбрасываются', () => {
		const fn = vi.fn()
		const throttled = throttle(fn, 100)
		throttled()
		throttled()
		throttled()
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('после окна снова пропускает', async () => {
		const fn = vi.fn()
		const throttled = throttle(fn, 30)
		throttled()
		await sleep(50)
		throttled()
		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('аргументы прокидываются', () => {
		const fn = vi.fn()
		throttle(fn, 100)('данные')
		expect(fn).toHaveBeenCalledWith('данные')
	})
})
// #endregion

// #region UTL-03
describe('UTL-03 throttleTrailing', () => {
	it('первый вызов сразу, последний в конце окна', async () => {
		const calls: number[] = []
		const throttled = throttleTrailing((n: number) => calls.push(n), 40)
		throttled(1)
		throttled(2)
		throttled(3)
		expect(calls).toEqual([1])
		await sleep(70)
		expect(calls).toEqual([1, 3])
	})

	it('одиночный вызов не дублируется', async () => {
		const fn = vi.fn()
		const throttled = throttleTrailing(fn, 30)
		throttled()
		await sleep(60)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region UTL-04
describe('UTL-04 once', () => {
	it('вызывается один раз', () => {
		const fn = vi.fn((n: number) => n * 2)
		const wrapped = once(fn)
		expect(wrapped(2)).toBe(4)
		expect(wrapped(10)).toBe(4)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('возвращает ту же ссылку', () => {
		const wrapped = once(() => ({ id: 1 }))
		expect(wrapped()).toBe(wrapped())
	})
})
// #endregion

// #region UTL-05
describe('UTL-05 memoize', () => {
	it('кэширует по аргументам', () => {
		const fn = vi.fn((a: number, b: number) => a + b)
		const wrapped = memoize(fn)
		expect(wrapped(1, 2)).toBe(3)
		expect(wrapped(1, 2)).toBe(3)
		expect(fn).toHaveBeenCalledTimes(1)
		wrapped(2, 3)
		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('undefined тоже кэшируется', () => {
		const fn = vi.fn(() => undefined)
		const wrapped = memoize(fn)
		wrapped()
		wrapped()
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('число и строка — разные ключи', () => {
		const fn = vi.fn((value: unknown) => typeof value)
		const wrapped = memoize(fn)
		expect(wrapped(1)).toBe('number')
		expect(wrapped('1')).toBe('string')
	})
})
// #endregion

// #region UTL-06
describe('UTL-06 memoizeByRef', () => {
	it('кэширует по ссылке', () => {
		const fn = vi.fn((obj: { id: number }) => obj.id * 2)
		const wrapped = memoizeByRef(fn)
		const key = { id: 5 }
		expect(wrapped(key)).toBe(10)
		expect(wrapped(key)).toBe(10)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('одинаковые по структуре, но разные объекты считаются заново', () => {
		const fn = vi.fn((obj: { id: number }) => obj.id)
		const wrapped = memoizeByRef(fn)
		wrapped({ id: 1 })
		wrapped({ id: 1 })
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
// #endregion

// #region UTL-07
describe('UTL-07 deepClone', () => {
	it('вложенные структуры копируются', () => {
		const source = { a: 1, b: { c: [1, 2, { d: 3 }] } }
		const copy = deepClone(source)
		expect(copy).toEqual(source)
		expect(copy.b).not.toBe(source.b)
		expect(copy.b.c).not.toBe(source.b.c)
	})

	it('Date остаётся Date', () => {
		const date = new Date('2020-05-01')
		const copy = deepClone({ date }).date
		expect(copy).toBeInstanceOf(Date)
		expect(copy.getTime()).toBe(date.getTime())
		expect(copy).not.toBe(date)
	})

	it('Map и Set копируются', () => {
		const source = { map: new Map([['k', { v: 1 }]]), set: new Set([1, 2]) }
		const copy = deepClone(source)
		expect(copy.map).toBeInstanceOf(Map)
		expect(copy.set).toBeInstanceOf(Set)
		expect(copy.map.get('k')).toEqual({ v: 1 })
		expect(copy.map.get('k')).not.toBe(source.map.get('k'))
	})

	it('циклическая ссылка не роняет стек', () => {
		type Node = { name: string; self?: Node }
		const node: Node = { name: 'a' }
		node.self = node
		const copy = deepClone(node)
		expect(copy.name).toBe('a')
		expect(copy.self).toBe(copy)
	})

	it('примитивы проходят насквозь', () => {
		expect(deepClone(5)).toBe(5)
		expect(deepClone(null)).toBeNull()
	})
})
// #endregion

// #region UTL-08
describe('UTL-08 deepEqual', () => {
	it('одинаковая структура', () => expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true))
	it('разные значения', () => expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false))
	it('разное число ключей', () => expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false))
	it('NaN равен NaN', () => expect(deepEqual(NaN, NaN)).toBe(true))
	it('0 и -0 различны', () => expect(deepEqual(0, -0)).toBe(false))
	it('массив и объект не равны', () => expect(deepEqual([1], { 0: 1 })).toBe(false))
	it('даты сравниваются по времени', () =>
		expect(deepEqual(new Date('2020-01-01'), new Date('2020-01-01'))).toBe(true))
})
// #endregion

// #region UTL-09
describe('UTL-09 deepMerge', () => {
	it('сливает вложенные объекты', () => {
		expect(deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 9, z: 3 } })).toEqual({ a: { x: 1, y: 9, z: 3 } })
	})
	it('массивы перетираются целиком', () => {
		expect(deepMerge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] })
	})
	it('не мутирует вход', () => {
		const target = { a: { x: 1 } }
		deepMerge(target, { a: { y: 2 } })
		expect(target).toEqual({ a: { x: 1 } })
	})
	it('новые ключи добавляются', () => {
		expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
	})
})
// #endregion

// #region UTL-10
describe('UTL-10 get', () => {
	const data = { a: { b: [{ c: 1 }] }, zero: 0, empty: '', nothing: null }

	it('идёт по точкам и индексам', () => expect(get(data, 'a.b[0].c')).toBe(1))
	it('битый путь даёт fallback', () => expect(get(data, 'a.x.y', 'нет')).toBe('нет'))
	it('ноль не подменяется fallback', () => expect(get(data, 'zero', 'нет')).toBe(0))
	it('пустая строка не подменяется', () => expect(get(data, 'empty', 'нет')).toBe(''))
	it('null не подменяется', () => expect(get(data, 'nothing', 'нет')).toBeNull())
	it('без fallback возвращает undefined', () => expect(get(data, 'a.x')).toBeUndefined())
})
// #endregion

// #region UTL-11
describe('UTL-11 set', () => {
	it('создаёт вложенную структуру', () => {
		expect(set({}, 'a.b[0].c', 1)).toEqual({ a: { b: [{ c: 1 }] } })
	})
	it('массив создаётся для числового ключа', () => {
		const result = set({}, 'list[1]', 'x') as { list: unknown[] }
		expect(Array.isArray(result.list)).toBe(true)
		expect(result.list[1]).toBe('x')
	})
	it('перезаписывает существующее', () => {
		expect(set({ a: { b: 1 } }, 'a.b', 2)).toEqual({ a: { b: 2 } })
	})
	it('не мутирует вход', () => {
		const source = { a: { b: 1 } }
		set(source, 'a.b', 99)
		expect(source.a.b).toBe(1)
	})
	it('соседние ветки сохраняются', () => {
		expect(set({ a: 1, nested: { keep: true } }, 'nested.added', 2)).toEqual({
			a: 1,
			nested: { keep: true, added: 2 },
		})
	})
})
// #endregion

// #region UTL-12
describe('UTL-12 EventEmitter', () => {
	it('доставляет аргументы', () => {
		const emitter = new EventEmitter()
		const handler = vi.fn()
		emitter.on('msg', handler)
		emitter.emit('msg', 1, 2)
		expect(handler).toHaveBeenCalledWith(1, 2)
	})

	it('on возвращает отписку', () => {
		const emitter = new EventEmitter()
		const handler = vi.fn()
		emitter.on('x', handler)()
		emitter.emit('x')
		expect(handler).not.toHaveBeenCalled()
	})

	it('off снимает обработчик', () => {
		const emitter = new EventEmitter()
		const handler = vi.fn()
		emitter.on('x', handler)
		emitter.off('x', handler)
		emitter.emit('x')
		expect(handler).not.toHaveBeenCalled()
	})

	it('once срабатывает один раз', () => {
		const emitter = new EventEmitter()
		const handler = vi.fn()
		emitter.once('x', handler)
		emitter.emit('x')
		emitter.emit('x')
		expect(handler).toHaveBeenCalledTimes(1)
		expect(emitter.listenerCount('x')).toBe(0)
	})

	it('off по исходной ссылке снимает и once', () => {
		const emitter = new EventEmitter()
		const handler = vi.fn()
		emitter.once('x', handler)
		emitter.off('x', handler)
		emitter.emit('x')
		expect(handler).not.toHaveBeenCalled()
	})

	it('обработчик, отписавший сам себя, не съедает соседей', () => {
		const emitter = new EventEmitter()
		const order: number[] = []
		const first: () => void = () => {
			order.push(1)
			emitter.off('x', first)
		}
		emitter.on('x', first)
		emitter.on('x', () => order.push(2))
		emitter.on('x', () => order.push(3))

		emitter.emit('x')
		// Если обходить живой набор, после удаления первого итератор перескочит второго.
		expect(order).toEqual([1, 2, 3])
		expect(emitter.listenerCount('x')).toBe(2)
	})

	it('событие без подписчиков не падает', () => {
		expect(() => new EventEmitter().emit('никого')).not.toThrow()
	})

	it('считает подписчиков', () => {
		const emitter = new EventEmitter()
		emitter.on('x', () => {})
		emitter.on('x', () => {})
		expect(emitter.listenerCount('x')).toBe(2)
		expect(emitter.listenerCount('y')).toBe(0)
	})
})
// #endregion

// #region UTL-13
describe('UTL-13 LRUCache', () => {
	it('хранит и отдаёт', () => {
		const cache = new LRUCache<string, number>(2)
		cache.set('a', 1)
		expect(cache.get('a')).toBe(1)
		expect(cache.get('нет')).toBeUndefined()
	})

	it('вытесняет самый старый', () => {
		const cache = new LRUCache<string, number>(2)
		cache.set('a', 1)
		cache.set('b', 2)
		cache.set('c', 3)
		expect(cache.has('a')).toBe(false)
		expect(cache.keys()).toEqual(['b', 'c'])
	})

	it('get обновляет давность', () => {
		const cache = new LRUCache<string, number>(2)
		cache.set('a', 1)
		cache.set('b', 2)
		cache.get('a')
		cache.set('c', 3)
		expect(cache.has('a')).toBe(true)
		expect(cache.has('b')).toBe(false)
	})

	it('повторный set тоже обновляет давность', () => {
		const cache = new LRUCache<string, number>(2)
		cache.set('a', 1)
		cache.set('b', 2)
		cache.set('a', 10)
		cache.set('c', 3)
		expect(cache.get('a')).toBe(10)
		expect(cache.has('b')).toBe(false)
	})

	it('размер не превышает ёмкость', () => {
		const cache = new LRUCache<number, number>(3)
		for (let i = 0; i < 10; i++) cache.set(i, i)
		expect(cache.size).toBe(3)
	})
})
// #endregion

// #region UTL-14
describe('UTL-14 curry', () => {
	const add3 = (a: number, b: number, c: number) => a + b + c

	it('по одному аргументу', () => {
		const curried = curry(add3 as never) as (a: number) => (b: number) => (c: number) => number
		expect(curried(1)(2)(3)).toBe(6)
	})
	it('пачками', () => {
		const curried = curry(add3 as never) as (...args: number[]) => never
		expect((curried(1, 2) as unknown as (c: number) => number)(3)).toBe(6)
	})
	it('все сразу', () => {
		const curried = curry(add3 as never) as (...args: number[]) => number
		expect(curried(1, 2, 3)).toBe(6)
	})
})
// #endregion

// #region UTL-15
describe('UTL-15 pipe и compose', () => {
	const double = (n: number) => n * 2
	const inc = (n: number) => n + 1

	it('pipe идёт слева направо', () => {
		expect(pipe(double as never, inc as never)(5)).toBe(11)
	})
	it('compose идёт справа налево', () => {
		expect(compose(double as never, inc as never)(5)).toBe(12)
	})
	it('без функций возвращает исходное', () => {
		expect(pipe()(7)).toBe(7)
	})
})
// #endregion

// #region UTL-16
describe('UTL-16 myBind', () => {
	it('привязывает this', () => {
		function greet(this: { name: string }, greeting: string) {
			return `${greeting}, ${this.name}`
		}
		const bound = myBind(greet, { name: 'Аня' })
		expect(bound('привет')).toBe('привет, Аня')
	})

	it('частично применяет аргументы', () => {
		function sum(this: unknown, a: number, b: number, c: number) {
			return a + b + c
		}
		const bound = myBind(sum, null, 1, 2)
		expect(bound(3)).toBe(6)
	})

	it('потерянный контекст восстанавливается', () => {
		const obj = {
			value: 42,
			read(this: { value: number }) {
				return this.value
			},
		}
		const loose = obj.read
		expect(myBind(loose, obj)()).toBe(42)
	})
})
// #endregion

// #region UTL-17
describe('UTL-17 myCall', () => {
	it('вызывает с нужным this', () => {
		function read(this: { value: number }) {
			return this.value
		}
		expect(myCall(read as (...args: unknown[]) => number, { value: 7 })).toBe(7)
	})

	it('передаёт аргументы', () => {
		function join(this: { sep: string }, a: string, b: string) {
			return `${a}${this.sep}${b}`
		}
		expect(myCall(join as (...args: unknown[]) => string, { sep: '-' }, 'a', 'b')).toBe('a-b')
	})

	it('не оставляет мусора в объекте', () => {
		const context = { value: 1 }
		myCall(function (this: { value: number }) {
			return this.value
		} as (...args: unknown[]) => number, context)
		expect(Object.getOwnPropertySymbols(context)).toHaveLength(0)
	})
})
// #endregion

// #region UTL-18
describe('UTL-18 cx', () => {
	it('строки', () => expect(cx('btn', 'big')).toBe('btn big'))
	it('falsy пропускаются', () => expect(cx('btn', null, undefined, false, '')).toBe('btn'))
	it('массивы разворачиваются', () => expect(cx('a', ['b', ['c']])).toBe('a b c'))
	it('объект по истинным ключам', () => expect(cx({ active: true, hidden: false })).toBe('active'))
	it('всё вместе', () => expect(cx('btn', ['big', null], { active: true, hidden: false })).toBe('btn big active'))
	it('пустой вызов', () => expect(cx()).toBe(''))
})
// #endregion

// #region UTL-19
describe('UTL-19 myInstanceOf', () => {
	class Animal {}
	class Dog extends Animal {}

	it('прямой экземпляр', () => expect(myInstanceOf(new Dog(), Dog)).toBe(true))
	it('родительский класс', () => expect(myInstanceOf(new Dog(), Animal)).toBe(true))
	it('чужой класс', () => expect(myInstanceOf(new Animal(), Dog)).toBe(false))
	it('массив и Object', () => expect(myInstanceOf([], Object)).toBe(true))
	it('примитивы всегда false', () => {
		expect(myInstanceOf(5, Number)).toBe(false)
		expect(myInstanceOf('a', String)).toBe(false)
		expect(myInstanceOf(null, Object)).toBe(false)
	})
})
// #endregion

// #region UTL-20
describe('UTL-20 deepFreeze', () => {
	it('замораживает вложенное', () => {
		const obj = deepFreeze({ a: { b: { c: 1 } } })
		expect(Object.isFrozen(obj.a.b)).toBe(true)
	})
	it('изменение вложенного не проходит', () => {
		const obj = deepFreeze({ nested: { value: 1 } })
		try {
			obj.nested.value = 2
		} catch {
			/* в strict mode присваивание бросает */
		}
		expect(obj.nested.value).toBe(1)
	})
	it('циклическая ссылка не роняет', () => {
		type Node = { self?: Node }
		const node: Node = {}
		node.self = node
		expect(() => deepFreeze(node)).not.toThrow()
	})
	it('примитивы проходят насквозь', () => expect(deepFreeze(5)).toBe(5))
})
// #endregion

// #region UTL-21
describe('UTL-21 rateLimiter', () => {
	it('пропускает до лимита', () => {
		const allow = rateLimiter(3, 1000)
		expect([allow(), allow(), allow(), allow()]).toEqual([true, true, true, false])
	})

	it('окно скользит', async () => {
		const allow = rateLimiter(2, 40)
		allow()
		allow()
		expect(allow()).toBe(false)
		await sleep(60)
		expect(allow()).toBe(true)
	})
})
// #endregion

// #region UTL-22
describe('UTL-22 createStore', () => {
	it('читает и пишет', () => {
		const store = createStore(1)
		expect(store.get()).toBe(1)
		store.set(2)
		expect(store.get()).toBe(2)
	})

	it('уведомляет подписчиков', () => {
		const store = createStore('a')
		const listener = vi.fn()
		store.subscribe(listener)
		store.set('b')
		expect(listener).toHaveBeenCalledWith('b')
	})

	it('не уведомляет при том же значении', () => {
		const store = createStore('a')
		const listener = vi.fn()
		store.subscribe(listener)
		store.set('a')
		expect(listener).not.toHaveBeenCalled()
	})

	it('отписка работает', () => {
		const store = createStore(0)
		const listener = vi.fn()
		store.subscribe(listener)()
		store.set(1)
		expect(listener).not.toHaveBeenCalled()
	})

	it('слушатель, отписавший сам себя, не съедает соседей', () => {
		const store = createStore(0)
		const order: number[] = []
		let unsubFirst = () => {}
		unsubFirst = store.subscribe(() => {
			order.push(1)
			unsubFirst()
		})
		store.subscribe(() => order.push(2))
		store.subscribe(() => order.push(3))

		store.set(1)
		expect(order).toEqual([1, 2, 3])

		order.length = 0
		store.set(2)
		expect(order).toEqual([2, 3])
	})
})
// #endregion

// #region UTL-23
describe('UTL-23 groupByPath', () => {
	const users = [
		{ name: 'Аня', address: { city: 'Москва' } },
		{ name: 'Боря', address: { city: 'Тверь' } },
		{ name: 'Вика', address: { city: 'Москва' } },
		{ name: 'Гена' },
	]

	it('группирует по вложенному полю', () => {
		const grouped = groupByPath(users, 'address.city')
		expect(Object.keys(grouped).sort()).toEqual(['unknown', 'Москва', 'Тверь'].sort())
		expect(grouped['Москва']).toHaveLength(2)
	})

	it('без поля попадает в unknown', () => {
		expect(groupByPath(users, 'address.city')['unknown']).toHaveLength(1)
	})
})
// #endregion

// #region UTL-24
describe('UTL-24 flattenObject', () => {
	it('разворачивает вложенность', () => {
		expect(flattenObject({ a: { b: 1 }, c: [2] })).toEqual({ 'a.b': 1, 'c[0]': 2 })
	})
	it('глубокая вложенность', () => {
		expect(flattenObject({ a: { b: { c: { d: 1 } } } })).toEqual({ 'a.b.c.d': 1 })
	})
	it('массив объектов', () => {
		expect(flattenObject({ list: [{ id: 1 }, { id: 2 }] })).toEqual({ 'list[0].id': 1, 'list[1].id': 2 })
	})
	it('пустой объект и массив сохраняются', () => {
		expect(flattenObject({ a: {}, b: [] })).toEqual({ a: {}, b: [] })
	})
	it('null остаётся значением', () => {
		expect(flattenObject({ a: null })).toEqual({ a: null })
	})
})
// #endregion
