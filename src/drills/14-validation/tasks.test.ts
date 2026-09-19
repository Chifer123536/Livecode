import { describe, expect, it, vi } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	ageOn,
	composeValidators,
	createAsyncValidator,
	inRange,
	isAdult,
	isEmail,
	isEmpty,
	isValidDateRu,
	isValidUrl,
	lengthBetween,
	luhnCheck,
	minLength,
	normalizePhone,
	passwordProblems,
	pattern,
	required,
	sanitizeInput,
	validateFile,
	validateForm,
} from './tasks'

// #region VAL-01
describe('VAL-01 isEmpty', () => {
	it('null и undefined', () => {
		expect(isEmpty(null)).toBe(true)
		expect(isEmpty(undefined)).toBe(true)
	})
	it('пустая строка и пробелы', () => {
		expect(isEmpty('')).toBe(true)
		expect(isEmpty('   ')).toBe(true)
	})
	it('пустые массив и объект', () => {
		expect(isEmpty([])).toBe(true)
		expect(isEmpty({})).toBe(true)
	})
	it('ноль и false не пустые', () => {
		expect(isEmpty(0)).toBe(false)
		expect(isEmpty(false)).toBe(false)
	})
	it('непустые значения', () => {
		expect(isEmpty('а')).toBe(false)
		expect(isEmpty([1])).toBe(false)
		expect(isEmpty({ a: 1 })).toBe(false)
	})
	it('дата не пустая', () => expect(isEmpty(new Date())).toBe(false))
})
// #endregion

// #region VAL-02
describe('VAL-02 isEmail', () => {
	it('обычная почта', () => expect(isEmail('a@b.ru')).toBe(true))
	it('поддомены', () => expect(isEmail('user.name@mail.corp.ru')).toBe(true))
	it('без зоны', () => expect(isEmail('a@b')).toBe(false))
	it('с пробелом', () => expect(isEmail('a b@c.ru')).toBe(false))
	it('две собаки', () => expect(isEmail('a@@b.ru')).toBe(false))
	it('пустая строка', () => expect(isEmail('')).toBe(false))
	it('точка сразу после собаки', () => expect(isEmail('a@.ru')).toBe(false))
})
// #endregion

// #region VAL-03
describe('VAL-03 normalizePhone', () => {
	it('восьмёрка меняется на семёрку', () => expect(normalizePhone('8 (999) 123-45-67')).toBe('+79991234567'))
	it('уже нормальный номер', () => expect(normalizePhone('+7 999 123 45 67')).toBe('+79991234567'))
	it('короткий номер', () => expect(normalizePhone('12345')).toBeNull())
	it('мусор', () => expect(normalizePhone('телефон')).toBeNull())
	it('лишние цифры', () => expect(normalizePhone('+7 999 123 45 67 89')).toBeNull())
})
// #endregion

// #region VAL-04
describe('VAL-04 passwordProblems', () => {
	it('хороший пароль', () => expect(passwordProblems('Password1')).toEqual([]))
	it('короткий и без заглавной', () => {
		expect(passwordProblems('abc')).toEqual(['Минимум 8 символов', 'Нужна заглавная буква', 'Нужна цифра'])
	})
	it('без цифры', () => expect(passwordProblems('Password')).toEqual(['Нужна цифра']))
	it('без строчной', () => expect(passwordProblems('PASSWORD1')).toEqual(['Нужна строчная буква']))
	it('пустой пароль — все правила', () => expect(passwordProblems('')).toHaveLength(4))
})
// #endregion

// #region VAL-05
describe('VAL-05 lengthBetween', () => {
	it('в диапазоне', () => expect(lengthBetween('абв', 2, 5)).toBe(true))
	it('границы включительно', () => {
		expect(lengthBetween('аб', 2, 5)).toBe(true)
		expect(lengthBetween('абвгд', 2, 5)).toBe(true)
	})
	it('слишком коротко', () => expect(lengthBetween('а', 2, 5)).toBe(false))
	it('пробелы не считаются', () => expect(lengthBetween('  а  ', 2, 5)).toBe(false))
})
// #endregion

// #region VAL-06
describe('VAL-06 inRange', () => {
	it('строка с числом', () => expect(inRange('5', 1, 10)).toBe(true))
	it('число', () => expect(inRange(5, 1, 10)).toBe(true))
	it('границы включительно', () => expect(inRange(1, 1, 10)).toBe(true))
	it('вне диапазона', () => expect(inRange(11, 1, 10)).toBe(false))
	it('пустая строка не ноль', () => expect(inRange('', 0, 10)).toBe(false))
	it('не число', () => expect(inRange('abc', 1, 10)).toBe(false))
	it('NaN', () => expect(inRange(NaN, 1, 10)).toBe(false))
})
// #endregion

// #region VAL-07
describe('VAL-07 isValidDateRu', () => {
	it('обычная дата', () => expect(isValidDateRu('05.03.2026')).toBe(true))
	it('високосный год', () => expect(isValidDateRu('29.02.2024')).toBe(true))
	it('29 февраля невисокосного', () => expect(isValidDateRu('29.02.2026')).toBe(false))
	it('31 апреля', () => expect(isValidDateRu('31.04.2026')).toBe(false))
	it('тринадцатый месяц', () => expect(isValidDateRu('01.13.2026')).toBe(false))
	it('однозначные числа', () => expect(isValidDateRu('1.1.2026')).toBe(false))
	it('мусор', () => expect(isValidDateRu('вчера')).toBe(false))
})
// #endregion

// #region VAL-08
describe('VAL-08 ageOn / isAdult', () => {
	const birth = new Date(2000, 5, 10)
	it('день рождения ещё не был', () => expect(ageOn(birth, new Date(2026, 5, 9))).toBe(25))
	it('день рождения сегодня', () => expect(ageOn(birth, new Date(2026, 5, 10))).toBe(26))
	it('месяц раньше', () => expect(ageOn(birth, new Date(2026, 0, 1))).toBe(25))
	it('совершеннолетие', () => {
		expect(isAdult(new Date(2008, 0, 1), new Date(2026, 0, 1))).toBe(true)
		expect(isAdult(new Date(2010, 0, 1), new Date(2026, 0, 1))).toBe(false)
	})
})
// #endregion

// #region VAL-09
describe('VAL-09 isValidUrl', () => {
	it('https', () => expect(isValidUrl('https://a.ru/x?y=1')).toBe(true))
	it('http', () => expect(isValidUrl('http://a.ru')).toBe(true))
	it('javascript отсекается', () => expect(isValidUrl('javascript:alert(1)')).toBe(false))
	it('без протокола', () => expect(isValidUrl('a.ru')).toBe(false))
	it('мусор', () => expect(isValidUrl('не ссылка')).toBe(false))
})
// #endregion

// #region VAL-10
describe('VAL-10 luhnCheck', () => {
	it('правильный номер', () => expect(luhnCheck('4561 2612 1234 5467')).toBe(true))
	it('опечатка в номере', () => expect(luhnCheck('1234 5678 1234 5678')).toBe(false))
	it('дефисы допустимы', () => expect(luhnCheck('4561-2612-1234-5467')).toBe(true))
	it('слишком короткий', () => expect(luhnCheck('4561')).toBe(false))
	it('буквы', () => expect(luhnCheck('4561 2612 1234 546x')).toBe(false))
})
// #endregion

// #region VAL-11
describe('VAL-11 required / minLength / pattern', () => {
	it('required на пустом', () => expect(required('Введите имя')('')).toBe('Введите имя'))
	it('required на заполненном', () => expect(required('Введите имя')('Ян')).toBeNull())
	it('required пропускает ноль', () => expect(required('Обязательно')(0)).toBeNull())
	it('minLength', () => {
		expect(minLength(3, 'Коротко')('аб')).toBe('Коротко')
		expect(minLength(3, 'Коротко')('абв')).toBeNull()
	})
	it('pattern', () => {
		expect(pattern(/^\d+$/, 'Только цифры')('12a')).toBe('Только цифры')
		expect(pattern(/^\d+$/, 'Только цифры')('12')).toBeNull()
	})
})
// #endregion

// #region VAL-12
describe('VAL-12 composeValidators', () => {
	it('возвращает первую ошибку', () => {
		const validate = composeValidators<string>([required('Пусто'), minLength(3, 'Коротко')])
		expect(validate('')).toBe('Пусто')
		expect(validate('аб')).toBe('Коротко')
		expect(validate('абв')).toBeNull()
	})
	it('после первой ошибки остальные не вызываются', () => {
		const second = vi.fn(() => null)
		composeValidators<string>([() => 'ошибка', second])('x')
		expect(second).not.toHaveBeenCalled()
	})
	it('пустой список валидаторов', () => expect(composeValidators<string>([])('x')).toBeNull())
})
// #endregion

// #region VAL-13
describe('VAL-13 validateForm', () => {
	/** Схема собирается внутри теста: до решения задачи фабрики валидаторов бросают исключение. */
	const makeSchema = () => ({
		name: [required('Введите имя')],
		email: [required('Введите почту'), pattern(/@/, 'Неверная почта')],
	})

	it('находит ошибки', () => {
		const result = validateForm({ name: '', email: 'abc' }, makeSchema())
		expect(result.valid).toBe(false)
		expect(result.errors).toEqual({ name: 'Введите имя', email: 'Неверная почта' })
	})
	it('форма без ошибок', () => {
		expect(validateForm({ name: 'Ян', email: 'a@b.ru' }, makeSchema())).toEqual({ valid: true, errors: {} })
	})
	it('в errors только проблемные поля', () => {
		expect(Object.keys(validateForm({ name: '', email: 'a@b.ru' }, makeSchema()).errors)).toEqual(['name'])
	})
	it('поле без правил не проверяется', () => {
		expect(validateForm({ name: '' }, {}).valid).toBe(true)
	})
})
// #endregion

// #region VAL-14
describe('VAL-14 validateFile', () => {
	const rules = { maxSize: 1000, extensions: ['png', 'jpg'] }

	it('подходящий файл', () => expect(validateFile({ name: 'a.PNG', size: 100 }, rules)).toBeNull())
	it('чужое расширение', () => {
		expect(validateFile({ name: 'a.exe', size: 10 }, rules)).toBe('Допустимые форматы: png, jpg')
	})
	it('слишком большой', () => {
		expect(validateFile({ name: 'a.png', size: 5000 }, rules)).toBe('Файл больше 1000 байт')
	})
	it('без расширения', () => {
		expect(validateFile({ name: 'файл', size: 10 }, rules)).toBe('Допустимые форматы: png, jpg')
	})
	it('точка в имени не путает', () => {
		expect(validateFile({ name: 'my.photo.png', size: 10 }, rules)).toBeNull()
	})
})
// #endregion

// #region VAL-15
describe('VAL-15 sanitizeInput', () => {
	it('обрезает и схлопывает пробелы', () => expect(sanitizeInput('  Ян   Ян ')).toBe('Ян Ян'))
	it('вырезает теги', () => expect(sanitizeInput('Ян <b>Ян</b>')).toBe('Ян Ян'))
	it('после вырезания тегов не остаётся двойных пробелов', () => {
		expect(sanitizeInput('<p>Ян</p>')).toBe('Ян')
	})
	it('пустая строка', () => expect(sanitizeInput('   ')).toBe(''))
	it('обычный текст не меняется', () => expect(sanitizeInput('обычный текст')).toBe('обычный текст'))
})
// #endregion

// #region VAL-16
describe('VAL-16 createAsyncValidator', () => {
	it('свободный логин — без ошибки', async () => {
		const validate = createAsyncValidator(async () => true, 'Занято')
		expect(await validate('ян')).toBeNull()
	})
	it('занятый логин — ошибка', async () => {
		const validate = createAsyncValidator(async () => false, 'Занято')
		expect(await validate('ян')).toBe('Занято')
	})
	it('то же значение не перепроверяется', async () => {
		const check = vi.fn(async () => true)
		const validate = createAsyncValidator(check, 'Занято')

		await validate('ян')
		await validate('ян')
		expect(check).toHaveBeenCalledTimes(1)
	})
	it('устаревший ответ игнорируется', async () => {
		const check = vi.fn(async (value: string) => {
			await sleep(value === 'ян' ? 30 : 5)
			return value !== 'яна'
		})
		const validate = createAsyncValidator(check, 'Занято')

		const stale = validate('ян')
		const fresh = validate('яна')

		expect(await fresh).toBe('Занято')
		expect(await stale).toBeNull()
	})
	it('новое значение проверяется заново', async () => {
		const check = vi.fn(async () => true)
		const validate = createAsyncValidator(check, 'Занято')

		await validate('ян')
		await validate('яна')
		expect(check).toHaveBeenCalledTimes(2)
	})
})
// #endregion
