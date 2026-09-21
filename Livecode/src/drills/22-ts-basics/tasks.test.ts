import { describe, expect, it } from 'vitest'
import {
	applyTwice,
	area,
	countBy,
	describeUser,
	fetchLength,
	firstEven,
	formatId,
	fullName,
	greet,
	isFinished,
	isRole,
	isString,
	last,
	lengthOf,
	move,
	onlyStrings,
	pluck,
	speak,
	sumAll,
	swap,
	withDefaults,
} from './tasks'

// #region TSB-01
describe('TSB-01 describeUser', () => {
	it('собирает строку', () => expect(describeUser('Аня', 30)).toBe('Имя: Аня, возраст: 30'))
	it('возраст 0 не теряется', () => expect(describeUser('Ян', 0)).toBe('Имя: Ян, возраст: 0'))
})
// #endregion

// #region TSB-02
describe('TSB-02 sumAll', () => {
	it('складывает', () => expect(sumAll([1, 2, 3])).toBe(6))
	it('пустой массив', () => expect(sumAll([])).toBe(0))
	it('отрицательные', () => expect(sumAll([-5, 5, -2])).toBe(-2))
})
// #endregion

// #region TSB-03
describe('TSB-03 greet', () => {
	it('без приветствия', () => expect(greet('Аня')).toBe('Привет, Аня!'))
	it('со своим приветствием', () => expect(greet('Аня', 'Здарова')).toBe('Здарова, Аня!'))
})
// #endregion

// #region TSB-04
describe('TSB-04 formatId', () => {
	it('число получает решётку', () => expect(formatId(42)).toBe('#42'))
	it('строка в верхний регистр', () => expect(formatId('ab12')).toBe('AB12'))
	it('ноль не теряется', () => expect(formatId(0)).toBe('#0'))
})
// #endregion

// #region TSB-05
describe('TSB-05 move', () => {
	it('вверх', () => expect(move(5, 'up')).toBe(6))
	it('вниз', () => expect(move(5, 'down')).toBe(4))
})
// #endregion

// #region TSB-06
describe('TSB-06 fullName', () => {
	it('склеивает имя', () => expect(fullName({ first: 'Ада', last: 'Лавлейс' })).toBe('Ада Лавлейс'))
})
// #endregion

// #region TSB-07
describe('TSB-07 withDefaults', () => {
	it('подставляет умолчание', () =>
		expect(withDefaults({ id: 'a' })).toEqual({ id: 'a', retries: 3 }))
	it('своё значение важнее', () =>
		expect(withDefaults({ id: 'a', retries: 7 })).toEqual({ id: 'a', retries: 7 }))
	it('ноль не подменяется', () => expect(withDefaults({ id: 'a', retries: 0 }).retries).toBe(0))
})
// #endregion

// #region TSB-08
describe('TSB-08 swap', () => {
	it('меняет местами', () => expect(swap(['a', 1])).toEqual([1, 'a']))
	it('длина сохраняется', () => expect(swap(['x', 9])).toHaveLength(2))
})
// #endregion

// #region TSB-09
describe('TSB-09 applyTwice', () => {
	it('дважды прибавляет', () => expect(applyTwice(3, n => n + 1)).toBe(5))
	it('дважды возводит', () => expect(applyTwice(2, n => n * n)).toBe(16))
})
// #endregion

// #region TSB-10
describe('TSB-10 lengthOf', () => {
	it('строка', () => expect(lengthOf('абв')).toBe(3))
	it('массив', () => expect(lengthOf([1, 2])).toBe(2))
	it('число', () => expect(lengthOf(42)).toBe(0))
	it('null', () => expect(lengthOf(null)).toBe(0))
})
// #endregion

// #region TSB-11
describe('TSB-11 speak', () => {
	it('собака', () => expect(speak({ bark: () => 'гав' })).toBe('гав'))
	it('кошка', () => expect(speak({ meow: () => 'мяу' })).toBe('мяу'))
})
// #endregion

// #region TSB-12
describe('TSB-12 area', () => {
	it('квадрат', () => expect(area({ kind: 'square', side: 3 })).toBe(9))
	it('круг', () => expect(area({ kind: 'circle', r: 1 })).toBeCloseTo(Math.PI))
})
// #endregion

// #region TSB-13
describe('TSB-13 isString', () => {
	it('строка', () => expect(isString('a')).toBe(true))
	it('число', () => expect(isString(1)).toBe(false))
	it('фильтрует', () => expect(onlyStrings([1, 'a', null, 'b'])).toEqual(['a', 'b']))
})
// #endregion

// #region TSB-14
describe('TSB-14 countBy', () => {
	it('считает повторы', () => expect(countBy(['a', 'b', 'a'])).toEqual({ a: 2, b: 1 }))
	it('пустой массив', () => expect(countBy([])).toEqual({}))
})
// #endregion

// #region TSB-15
describe('TSB-15 isFinished', () => {
	it('done завершён', () => expect(isFinished('done')).toBe(true))
	it('error завершён', () => expect(isFinished('error')).toBe(true))
	it('loading нет', () => expect(isFinished('loading')).toBe(false))
})
// #endregion

// #region TSB-16
describe('TSB-16 isRole', () => {
	it('роль есть', () => expect(isRole('admin')).toBe(true))
	it('роли нет', () => expect(isRole('boss')).toBe(false))
})
// #endregion

// #region TSB-17
describe('TSB-17 last', () => {
	it('последний', () => expect(last([1, 2])).toBe(2))
	it('пустой массив', () => expect(last([])).toBeUndefined())
	it('строки', () => expect(last(['a', 'b'])).toBe('b'))
})
// #endregion

// #region TSB-18
describe('TSB-18 pluck', () => {
	it('собирает числа', () => expect(pluck([{ id: 1 }, { id: 2 }], 'id')).toEqual([1, 2]))
	it('собирает строки', () =>
		expect(pluck([{ name: 'а' }, { name: 'б' }], 'name')).toEqual(['а', 'б']))
})
// #endregion

// #region TSB-19
describe('TSB-19 fetchLength', () => {
	it('длина строки', async () => expect(await fetchLength(async () => 'абв')).toBe(3))
	it('пустая строка', async () => expect(await fetchLength(async () => '')).toBe(0))
})
// #endregion

// #region TSB-20
describe('TSB-20 firstEven', () => {
	it('находит чётное', () => expect(firstEven([1, 3, 4])).toBe(4))
	it('нет чётных', () => expect(firstEven([1, 3])).toBeNull())
	it('ноль считается чётным', () => expect(firstEven([1, 0])).toBe(0))
})
// #endregion
