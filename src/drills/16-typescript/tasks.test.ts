import { describe, expect, it, vi } from 'vitest'
import {
	area,
	err,
	first,
	getProp,
	isRole,
	isString,
	len,
	ok,
	omit,
	onlyStrings,
	parseUser,
	pick,
	ROLES,
	sumField,
	TypedEmitter,
	unwrapOr,
	type EventMap,
} from './tasks'

// #region TS-01
describe('TS-01 first', () => {
	it('берёт первый элемент', () => expect(first([1, 2, 3])).toBe(1))
	it('пустой массив даёт undefined', () => expect(first([])).toBeUndefined())
	it('работает со строками', () => expect(first(['a', 'b'])).toBe('a'))
})
// #endregion

// #region TS-02
describe('TS-02 getProp', () => {
	it('достаёт значение', () => expect(getProp({ a: 1, b: 'x' }, 'b')).toBe('x'))
	it('работает с числами', () => expect(getProp({ a: 1 }, 'a')).toBe(1))
})
// #endregion

// #region TS-03
describe('TS-03 pick', () => {
	it('берёт нужные ключи', () => expect(pick({ a: 1, b: 'x', c: true }, ['a', 'c'])).toEqual({ a: 1, c: true }))
	it('пустой список ключей', () => expect(pick({ a: 1 }, [])).toEqual({}))
	it('не мутирует вход', () => {
		const src = { a: 1, b: 2 }
		pick(src, ['a'])
		expect(src).toEqual({ a: 1, b: 2 })
	})
})
// #endregion

// #region TS-04
describe('TS-04 omit', () => {
	it('убирает ключи', () => expect(omit({ a: 1, b: 'x' }, ['b'])).toEqual({ a: 1 }))
	it('не мутирует вход', () => {
		const src = { a: 1, b: 2 }
		omit(src, ['b'])
		expect(src).toEqual({ a: 1, b: 2 })
	})
})
// #endregion

// #region TS-05
describe('TS-05 isString', () => {
	it('узнаёт строку', () => expect(isString('a')).toBe(true))
	it('число не строка', () => expect(isString(1)).toBe(false))
	it('фильтрует строки', () => expect(onlyStrings([1, 'a', null, 'b'])).toEqual(['a', 'b']))
	it('объект-обёртка не считается строкой', () => expect(isString(new String('a'))).toBe(false))
})
// #endregion

// #region TS-06
describe('TS-06 area', () => {
	it('круг', () => expect(area({ kind: 'circle', r: 2 })).toBeCloseTo(12.566, 3))
	it('прямоугольник', () => expect(area({ kind: 'rect', w: 2, h: 3 })).toBe(6))
	it('квадрат', () => expect(area({ kind: 'square', size: 3 })).toBe(9))
})
// #endregion

// #region TS-07
describe('TS-07 isRole', () => {
	it('известная роль', () => expect(isRole('admin')).toBe(true))
	it('неизвестная роль', () => expect(isRole('root')).toBe(false))
	it('все роли на месте', () => expect(ROLES.every(role => isRole(role))).toBe(true))
})
// #endregion

// #region TS-08
describe('TS-08 Result', () => {
	it('ok несёт значение', () => expect(ok(5)).toEqual({ ok: true, value: 5 }))
	it('err несёт ошибку', () => expect(err('плохо')).toEqual({ ok: false, error: 'плохо' }))
	it('unwrapOr достаёт значение', () => expect(unwrapOr(ok(5), 0)).toBe(5))
	it('unwrapOr отдаёт запасное', () => expect(unwrapOr(err('плохо'), 0)).toBe(0))
})
// #endregion

// #region TS-09
describe('TS-09 parseUser', () => {
	it('разбирает корректный объект', () =>
		expect(parseUser('{"id":1,"name":"Аня"}')).toEqual({ ok: true, value: { id: 1, name: 'Аня' } }))
	it('битый json', () => expect(parseUser('{не json')).toEqual({ ok: false, error: 'битый json' }))
	it('не тот формат', () => expect(parseUser('{"id":"1"}')).toEqual({ ok: false, error: 'не тот формат' }))
	it('null не объект', () => expect(parseUser('null')).toEqual({ ok: false, error: 'не тот формат' }))
	it('лишние поля не мешают', () => {
		const result = parseUser('{"id":1,"name":"Аня","extra":true}')
		expect(result).toEqual({ ok: true, value: { id: 1, name: 'Аня' } })
	})
})
// #endregion

// #region TS-10
describe('TS-10 len', () => {
	it('длина строки', () => expect(len('абв')).toBe(3))
	it('длина массива', () => expect(len([1, 2])).toBe(2))
	it('пустые значения', () => {
		expect(len('')).toBe(0)
		expect(len([])).toBe(0)
	})
})
// #endregion

// #region TS-11
describe('TS-11 sumField', () => {
	it('суммирует поле', () => expect(sumField([{ price: 10 }, { price: 5 }], 'price')).toBe(15))
	it('пустой список', () => expect(sumField([] as Array<{ price: number }>, 'price')).toBe(0))
})
// #endregion

// #region TS-12
describe('TS-12 TypedEmitter', () => {
	it('доставляет нагрузку подписчику', () => {
		const emitter = new TypedEmitter<EventMap>()
		const handler = vi.fn()
		emitter.on('login', handler)
		emitter.emit('login', { userId: 1 })
		expect(handler).toHaveBeenCalledWith({ userId: 1 })
	})

	it('разные события не пересекаются', () => {
		const emitter = new TypedEmitter<EventMap>()
		const onLogin = vi.fn()
		emitter.on('login', onLogin)
		emitter.emit('error', 'упало')
		expect(onLogin).not.toHaveBeenCalled()
	})

	it('on возвращает отписку', () => {
		const emitter = new TypedEmitter<EventMap>()
		const handler = vi.fn()
		const unsubscribe = emitter.on('error', handler)
		unsubscribe()
		emitter.emit('error', 'упало')
		expect(handler).not.toHaveBeenCalled()
	})

	it('событие без подписчиков не падает', () => {
		const emitter = new TypedEmitter<EventMap>()
		expect(() => emitter.emit('logout', undefined)).not.toThrow()
	})
})
// #endregion
