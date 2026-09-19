import { describe, expect, it } from 'vitest'
import {
	camelizeKeys,
	deepKeys,
	denormalize,
	entriesByValueDesc,
	fromMap,
	hasPath,
	indexById,
	invert,
	isEmpty,
	isPlainObject,
	mapKeys,
	mapValues,
	maxKeyByValue,
	normalize,
	objectDiff,
	omit,
	omitBy,
	parseQuery,
	pick,
	pickBy,
	removeEmpty,
	renameKeys,
	shallowEqual,
	sortKeys,
	sumValues,
	toMap,
	toQuery,
	updateIn,
	withDefaults,
} from './tasks'

// #region OBJ-01
describe('OBJ-01 pick', () => {
	it('берёт указанные ключи', () => expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 }))
	it('пустой список ключей', () => expect(pick({ a: 1 }, [])).toEqual({}))
	it('не мутирует вход', () => {
		const source = { a: 1, b: 2 }
		pick(source, ['a'])
		expect(source).toEqual({ a: 1, b: 2 })
	})
})
// #endregion

// #region OBJ-02
describe('OBJ-02 omit', () => {
	it('убирает ключи', () => expect(omit({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 }))
	it('несуществующий ключ ничего не ломает', () => expect(omit({ a: 1 }, ['b' as 'a'])).toEqual({ a: 1 }))
	it('не мутирует вход', () => {
		const source = { a: 1, b: 2 }
		omit(source, ['b'])
		expect(source).toEqual({ a: 1, b: 2 })
	})
})
// #endregion

// #region OBJ-03
describe('OBJ-03 invert', () => {
	it('меняет местами', () => expect(invert({ a: 'x', b: 'y' })).toEqual({ x: 'a', y: 'b' }))
	it('дубли значений схлопываются', () => expect(invert({ a: 'x', b: 'x' })).toEqual({ x: 'b' }))
})
// #endregion

// #region OBJ-04
describe('OBJ-04 mapValues', () => {
	it('преобразует значения', () => expect(mapValues({ a: 1, b: 2 }, n => n * 10)).toEqual({ a: 10, b: 20 }))
	it('передаёт ключ', () => expect(mapValues({ a: 1 }, (n, key) => `${key}${n}`)).toEqual({ a: 'a1' }))
	it('пустой объект', () => expect(mapValues({}, n => n)).toEqual({}))
})
// #endregion

// #region OBJ-05
describe('OBJ-05 mapKeys', () => {
	it('преобразует ключи', () => expect(mapKeys({ a: 1 }, key => key.toUpperCase())).toEqual({ A: 1 }))
	it('значение доступно в колбэке', () => expect(mapKeys({ a: 5 }, (key, value) => `${key}${value}`)).toEqual({ a5: 5 }))
})
// #endregion

// #region OBJ-06
describe('OBJ-06 pickBy', () => {
	it('оставляет подходящие', () => expect(pickBy({ a: 1, b: 0, c: 3 }, n => n > 0)).toEqual({ a: 1, c: 3 }))
	it('ключ доступен в предикате', () => expect(pickBy({ a: 1, bb: 2 }, (_, key) => key.length === 1)).toEqual({ a: 1 }))
})
// #endregion

// #region OBJ-07
describe('OBJ-07 omitBy', () => {
	it('выкидывает подходящие', () => expect(omitBy({ a: 1, b: 0 }, n => n === 0)).toEqual({ a: 1 }))
	it('ничего не подошло', () => expect(omitBy({ a: 1 }, () => false)).toEqual({ a: 1 }))
})
// #endregion

// #region OBJ-08
describe('OBJ-08 isEmpty', () => {
	it('пустой', () => expect(isEmpty({})).toBe(true))
	it('с ключом', () => expect(isEmpty({ a: 1 })).toBe(false))
	it('ключ со значением undefined считается', () => expect(isEmpty({ a: undefined })).toBe(false))
})
// #endregion

// #region OBJ-09
describe('OBJ-09 isPlainObject', () => {
	it('литерал', () => expect(isPlainObject({})).toBe(true))
	it('Object.create(null)', () => expect(isPlainObject(Object.create(null))).toBe(true))
	it('массив', () => expect(isPlainObject([])).toBe(false))
	it('null', () => expect(isPlainObject(null)).toBe(false))
	it('Date', () => expect(isPlainObject(new Date())).toBe(false))
	it('Map', () => expect(isPlainObject(new Map())).toBe(false))
	it('экземпляр класса', () => {
		class Foo {}
		expect(isPlainObject(new Foo())).toBe(false)
	})
	it('функция', () => expect(isPlainObject(() => {})).toBe(false))
})
// #endregion

// #region OBJ-10
describe('OBJ-10 withDefaults', () => {
	it('подставляет недостающее', () => expect(withDefaults({ a: 0 }, { a: 9, b: 2 })).toEqual({ a: 0, b: 2 }))
	it('явный undefined заменяется дефолтом', () =>
		expect(withDefaults({ a: undefined }, { a: 9 })).toEqual({ a: 9 }))
	it('null считается заданным', () =>
		expect(withDefaults({ a: null } as never, { a: 9 })).toEqual({ a: null }))
	it('пустой объект даёт дефолты', () => expect(withDefaults({}, { a: 1, b: 2 })).toEqual({ a: 1, b: 2 }))
})
// #endregion

// #region OBJ-11
describe('OBJ-11 indexById', () => {
	it('строит словарь', () =>
		expect(indexById([{ id: 'a', n: 1 }, { id: 'b', n: 2 }])).toEqual({
			a: { id: 'a', n: 1 },
			b: { id: 'b', n: 2 },
		}))
	it('пустой список', () => expect(indexById([])).toEqual({}))
})
// #endregion

// #region OBJ-12
describe('OBJ-12 normalize', () => {
	it('разделяет данные и порядок', () => {
		const result = normalize([{ id: 'a' }, { id: 'b' }])
		expect(result.allIds).toEqual(['a', 'b'])
		expect(result.byId.a).toEqual({ id: 'a' })
	})
	it('пустой список', () => expect(normalize([])).toEqual({ byId: {}, allIds: [] }))
})
// #endregion

// #region OBJ-13
describe('OBJ-13 denormalize', () => {
	it('возвращает исходный порядок', () => {
		const list = [{ id: 'a' }, { id: 'b' }]
		expect(denormalize(normalize(list))).toEqual(list)
	})
	it('пропускает id без записи', () => {
		expect(denormalize({ byId: { a: { id: 'a' } }, allIds: ['a', 'нет'] })).toEqual([{ id: 'a' }])
	})
})
// #endregion

// #region OBJ-14
describe('OBJ-14 renameKeys', () => {
	it('переименовывает по карте', () =>
		expect(renameKeys({ user_name: 'Аня' }, { user_name: 'userName' })).toEqual({ userName: 'Аня' }))
	it('ключи вне карты остаются', () =>
		expect(renameKeys({ a: 1, b: 2 }, { a: 'x' })).toEqual({ x: 1, b: 2 }))
})
// #endregion

// #region OBJ-15
describe('OBJ-15 removeEmpty', () => {
	it('выкидывает пустое, оставляет ноль и false', () =>
		expect(removeEmpty({ a: 1, b: null, c: '', d: 0, e: false })).toEqual({ a: 1, d: 0, e: false }))
	it('undefined тоже выкидывается', () => expect(removeEmpty({ a: undefined, b: 1 })).toEqual({ b: 1 }))
})
// #endregion

// #region OBJ-16
describe('OBJ-16 toQuery', () => {
	it('простые значения', () => expect(toQuery({ a: 1, b: 'x' })).toBe('a=1&b=x'))
	it('пропускает null и undefined', () => expect(toQuery({ a: 1, b: null, c: undefined })).toBe('a=1'))
	it('кодирует кириллицу', () => expect(toQuery({ b: 'да' })).toBe('b=%D0%B4%D0%B0'))
	it('массив даёт повторяющийся ключ', () => expect(toQuery({ tag: ['a', 'b'] })).toBe('tag=a&tag=b'))
	it('пустой объект', () => expect(toQuery({})).toBe(''))
})
// #endregion

// #region OBJ-17
describe('OBJ-17 parseQuery', () => {
	it('разбирает пары', () => expect(parseQuery('a=1&b=x')).toEqual({ a: '1', b: 'x' }))
	it('ведущий вопрос не мешает', () => expect(parseQuery('?a=1')).toEqual({ a: '1' }))
	it('повтор ключа даёт массив', () => expect(parseQuery('tag=a&tag=b')).toEqual({ tag: ['a', 'b'] }))
	it('три повтора', () => expect(parseQuery('t=a&t=b&t=c')).toEqual({ t: ['a', 'b', 'c'] }))
	it('пустая строка', () => expect(parseQuery('')).toEqual({}))
	it('декодирует значения', () => expect(parseQuery('b=%D0%B4%D0%B0')).toEqual({ b: 'да' }))
})
// #endregion

// #region OBJ-18
describe('OBJ-18 hasPath', () => {
	it('существующий путь', () => expect(hasPath({ a: { b: 1 } }, 'a.b')).toBe(true))
	it('undefined по существующему ключу', () => expect(hasPath({ a: { b: undefined } }, 'a.b')).toBe(true))
	it('отсутствующий ключ', () => expect(hasPath({ a: {} }, 'a.b')).toBe(false))
	it('обрыв на примитиве', () => expect(hasPath({ a: 1 }, 'a.b')).toBe(false))
})
// #endregion

// #region OBJ-19
describe('OBJ-19 updateIn', () => {
	it('обновляет значение по пути', () => {
		expect(updateIn({ a: { b: 1 } }, 'a.b', n => (n as number) + 1)).toEqual({ a: { b: 2 } })
	})
	it('не мутирует исходный объект', () => {
		const source = { a: { b: 1 } }
		updateIn(source, 'a.b', () => 99)
		expect(source.a.b).toBe(1)
	})
	it('нетронутые ветки переиспользуются по ссылке', () => {
		const source = { a: { b: 1 }, keep: { deep: true } }
		const next = updateIn(source, 'a.b', () => 2)
		expect(next.keep).toBe(source.keep)
		expect(next.a).not.toBe(source.a)
	})
	it('создаёт недостающий уровень', () => {
		expect(updateIn({} as { a?: { b?: number } }, 'a.b', () => 1)).toEqual({ a: { b: 1 } })
	})
})
// #endregion

// #region OBJ-20
describe('OBJ-20 objectDiff', () => {
	it('находит изменённое', () => expect(objectDiff({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual({ b: 3 }))
	it('без изменений — пустой объект', () => expect(objectDiff({ a: 1 }, { a: 1 })).toEqual({}))
	it('NaN не считается изменением', () => expect(objectDiff({ a: NaN }, { a: NaN })).toEqual({}))
	it('новый ключ попадает в результат', () =>
		expect(objectDiff({ a: 1 } as Record<string, unknown>, { a: 1, b: 2 })).toEqual({ b: 2 }))
})
// #endregion

// #region OBJ-21
describe('OBJ-21 deepKeys', () => {
	it('собирает пути листьев', () => expect(deepKeys({ a: { b: 1 }, c: 2 })).toEqual(['a.b', 'c']))
	it('глубокая вложенность', () => expect(deepKeys({ a: { b: { c: { d: 1 } } } })).toEqual(['a.b.c.d']))
	it('массив считается листом', () => expect(deepKeys({ list: [1, 2] })).toEqual(['list']))
	it('пустой объект внутри', () => expect(deepKeys({ a: {} })).toEqual(['a']))
})
// #endregion

// #region OBJ-22
describe('OBJ-22 sumValues', () => {
	it('складывает', () => expect(sumValues({ a: 1, b: 2 })).toBe(3))
	it('пустой объект', () => expect(sumValues({})).toBe(0))
})
// #endregion

// #region OBJ-23
describe('OBJ-23 maxKeyByValue', () => {
	it('находит максимум', () => expect(maxKeyByValue({ a: 1, b: 5, c: 3 })).toBe('b'))
	it('при равенстве первый', () => expect(maxKeyByValue({ a: 1, b: 5, c: 5 })).toBe('b'))
	it('пустой объект', () => expect(maxKeyByValue({})).toBeNull())
	it('отрицательные значения', () => expect(maxKeyByValue({ a: -5, b: -1 })).toBe('b'))
})
// #endregion

// #region OBJ-24
describe('OBJ-24 sortKeys', () => {
	it('сортирует ключи', () => expect(Object.keys(sortKeys({ b: 1, a: 2, c: 3 }))).toEqual(['a', 'b', 'c']))
	it('значения сохраняются', () => expect(sortKeys({ b: 1, a: 2 })).toEqual({ a: 2, b: 1 }))
	it('даёт стабильный JSON', () =>
		expect(JSON.stringify(sortKeys({ b: 1, a: 2 }))).toBe(JSON.stringify(sortKeys({ a: 2, b: 1 }))))
})
// #endregion

// #region OBJ-25
describe('OBJ-25 camelizeKeys', () => {
	it('переименовывает вложенные ключи', () =>
		expect(camelizeKeys({ user_name: 'Аня', address_info: { city_name: 'Тверь' } })).toEqual({
			userName: 'Аня',
			addressInfo: { cityName: 'Тверь' },
		}))
	it('работает внутри массивов', () =>
		expect(camelizeKeys({ items: [{ item_id: 1 }] })).toEqual({ items: [{ itemId: 1 }] }))
	it('значения не трогает', () => expect(camelizeKeys({ a_b: 'не_меняем' })).toEqual({ aB: 'не_меняем' }))
	it('Date остаётся собой', () => {
		const date = new Date('2020-01-01')
		expect((camelizeKeys({ created_at: date }) as { createdAt: Date }).createdAt).toBe(date)
	})
	it('примитив возвращается как есть', () => expect(camelizeKeys(5)).toBe(5))
})
// #endregion

// #region OBJ-26
describe('OBJ-26 entriesByValueDesc', () => {
	it('сортирует по убыванию значения', () =>
		expect(entriesByValueDesc({ a: 1, b: 3, c: 3 })).toEqual([
			['b', 3],
			['c', 3],
			['a', 1],
		]))
	it('пустой объект', () => expect(entriesByValueDesc({})).toEqual([]))
})
// #endregion

// #region OBJ-27
describe('OBJ-27 toMap и fromMap', () => {
	it('в Map', () => {
		const map = toMap({ a: 1 })
		expect(map).toBeInstanceOf(Map)
		expect(map.get('a')).toBe(1)
	})
	it('из Map', () => expect(fromMap(new Map([['a', 1]]))).toEqual({ a: 1 }))
	it('туда и обратно', () => expect(fromMap(toMap({ a: 1, b: 2 }))).toEqual({ a: 1, b: 2 }))
})
// #endregion

// #region OBJ-28
describe('OBJ-28 shallowEqual', () => {
	it('одинаковые примитивы', () => expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true))
	it('разные значения', () => expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false))
	it('вложенные объекты сравниваются по ссылке', () => expect(shallowEqual({ a: {} }, { a: {} })).toBe(false))
	it('та же ссылка внутри — равны', () => {
		const shared = {}
		expect(shallowEqual({ a: shared }, { a: shared })).toBe(true)
	})
	it('разное число ключей', () => expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false))
	it('NaN равен NaN', () => expect(shallowEqual({ a: NaN }, { a: NaN })).toBe(true))
})
// #endregion
