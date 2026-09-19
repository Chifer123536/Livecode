/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 14. Открывать только после своей попытки.
 */

export type Validator<T> = (value: T) => string | null

// #region VAL-01 | Пустое значение
/**
 * Порядок проверок важен: сначала null/undefined, потом строка, массив и только потом объект —
 * иначе typeof null === 'object' уведёт в ветку объекта.
 * Ноль и false пустыми не считаются: `if (!value)` в валидации формы — классический баг,
 * из-за которого нельзя ввести цену 0.
 */
export const isEmpty = (value: unknown): boolean => {
	if (value === null || value === undefined) return true
	if (typeof value === 'string') return value.trim() === ''
	if (Array.isArray(value)) return value.length === 0
	if (value instanceof Date) return false
	if (typeof value === 'object') return Object.keys(value).length === 0
	return false
}
// #endregion

// #region VAL-02 | Почта
/**
 * Умышленно простая регулярка: имя без пробелов и собак, собака, домен, точка, зона от двух букв.
 * Полная проверка по RFC 5322 — это сотни символов, которые всё равно не гарантируют
 * существование ящика. В проде проверяют письмом со ссылкой, и это правильный ответ на собесе.
 */
export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/.test(value.trim())
// #endregion

// #region VAL-03 | Телефон
/**
 * Сначала нормализация, потом проверка — так функция принимает любой формат ввода.
 * Ведущая 8 меняется на 7: это один и тот же номер, и пользователь вправе набрать любой вариант.
 */
export const normalizePhone = (value: string): string | null => {
	let digits = value.replace(/\D/g, '')
	if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
	if (digits.length === 10) digits = `7${digits}`

	if (digits.length !== 11 || !digits.startsWith('7')) return null
	return `+${digits}`
}
// #endregion

// #region VAL-04 | Проблемы пароля
/** Список правил рядом друг с другом: добавить новое — одна строка, а не новая ветка if. */
export const passwordProblems = (password: string): string[] => {
	const rules: Array<[boolean, string]> = [
		[password.length >= 8, 'Минимум 8 символов'],
		[/[A-ZА-ЯЁ]/.test(password), 'Нужна заглавная буква'],
		[/[a-zа-яё]/.test(password), 'Нужна строчная буква'],
		[/\d/.test(password), 'Нужна цифра'],
	]
	return rules.filter(([ok]) => !ok).map(([, message]) => message)
}
// #endregion

// #region VAL-05 | Длина в диапазоне
export const lengthBetween = (value: string, min: number, max: number): boolean => {
	const length = value.trim().length
	return length >= min && length <= max
}
// #endregion

// #region VAL-06 | Число в диапазоне
/**
 * Number('') даёт 0 — поэтому пустую строку отсекаем отдельно, иначе пустое поле
 * пройдёт проверку «от 0 до 10». Number.isFinite отсекает NaN и бесконечности.
 */
export const inRange = (value: string | number, min: number, max: number): boolean => {
	if (typeof value === 'string' && value.trim() === '') return false

	const number = Number(value)
	return Number.isFinite(number) && number >= min && number <= max
}
// #endregion

// #region VAL-07 | Дата ДД.ММ.ГГГГ
/**
 * Формат проверяет регулярка, существование — сверка обратно.
 * new Date(2026, 1, 31) молча превращается в 3 марта, поэтому сравниваем
 * день и месяц собранной даты с исходными числами: не совпало — даты не существует.
 */
export const isValidDateRu = (value: string): boolean => {
	const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
	if (!match) return false

	const [, day, month, year] = match.map(Number)
	const date = new Date(year, month - 1, day)

	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}
// #endregion

// #region VAL-08 | Возраст
/**
 * Разница лет минус поправка на «день рождения ещё не был».
 * Сравнение по паре (месяц, день) — считать через миллисекунды нельзя:
 * високосные годы дадут ошибку на сутки.
 */
export const ageOn = (birthDate: Date, now: Date): number => {
	let age = now.getFullYear() - birthDate.getFullYear()

	const monthDiff = now.getMonth() - birthDate.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) age -= 1

	return age
}

export const isAdult = (birthDate: Date, now: Date): boolean => ageOn(birthDate, now) >= 18
// #endregion

// #region VAL-09 | Ссылка
/**
 * Конструктор URL разбирает адрес по спецификации и бросает на мусоре.
 * Белый список протоколов обязателен: 'javascript:alert(1)' — валидный URL,
 * и без проверки протокола он уедет в href.
 */
export const isValidUrl = (value: string): boolean => {
	try {
		const url = new URL(value)
		return url.protocol === 'http:' || url.protocol === 'https:'
	} catch {
		return false
	}
}
// #endregion

// #region VAL-10 | Номер карты
/**
 * Луна: идём справа налево, каждую вторую цифру удваиваем, из результата больше 9 вычитаем 9,
 * сумма должна делиться на 10. Проверяет опечатки, а не существование карты.
 */
export const luhnCheck = (value: string): boolean => {
	const digits = value.replace(/[\s-]/g, '')
	if (!/^\d{12,19}$/.test(digits)) return false

	let sum = 0
	let double = false

	for (let i = digits.length - 1; i >= 0; i -= 1) {
		let digit = Number(digits[i])
		if (double) {
			digit *= 2
			if (digit > 9) digit -= 9
		}
		sum += digit
		double = !double
	}
	return sum % 10 === 0
}
// #endregion

// #region VAL-11 | Готовые валидаторы
/** Текст ошибки приходит снаружи: так один валидатор работает в любой форме и на любом языке. */
export const required =
	(message: string): Validator<unknown> =>
	value =>
		isEmpty(value) ? message : null

export const minLength =
	(min: number, message: string): Validator<string> =>
	value =>
		value.trim().length >= min ? null : message

export const pattern =
	(regexp: RegExp, message: string): Validator<string> =>
	value =>
		regexp.test(value) ? null : message
// #endregion

// #region VAL-12 | Композиция валидаторов
/**
 * Цикл с ранним выходом, а не map + find: валидаторы бывают дорогими,
 * и после первой ошибки остальные выполнять незачем.
 */
export const composeValidators =
	<T>(validators: Array<Validator<T>>): Validator<T> =>
	value => {
		for (const validate of validators) {
			const error = validate(value)
			if (error) return error
		}
		return null
	}
// #endregion

// #region VAL-13 | Валидация формы по схеме
/**
 * В errors попадают только проблемные поля — пустые строки в ошибках
 * ломают проверку `errors.name && ...` в разметке.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>
export type Schema<T> = { [K in keyof T]?: Array<Validator<T[K]>> }

export const validateForm = <T extends object>(
	values: T,
	schema: Schema<T>
): { valid: boolean; errors: FormErrors<T> } => {
	const errors: FormErrors<T> = {}

	for (const key of Object.keys(schema) as Array<keyof T>) {
		const validators = schema[key]
		if (!validators) continue

		const error = composeValidators(validators)(values[key])
		if (error) errors[key] = error
	}
	return { valid: Object.keys(errors).length === 0, errors }
}
// #endregion

// #region VAL-14 | Файл
/**
 * Расширение берём после последней точки и приводим к нижнему регистру:
 * 'photo.PNG' и 'photo.png' — одно и то же, а 'my.photo.png' не должно дать 'photo.png'.
 */
export type FileLike = { name: string; size: number }

export const validateFile = (
	file: FileLike,
	rules: { maxSize: number; extensions: string[] }
): string | null => {
	const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
	const allowed = rules.extensions.map(item => item.toLowerCase())

	if (!file.name.includes('.') || !allowed.includes(extension)) return `Допустимые форматы: ${rules.extensions.join(', ')}`
	if (file.size > rules.maxSize) return `Файл больше ${rules.maxSize} байт`
	return null
}
// #endregion

// #region VAL-15 | Очистка ввода
/**
 * Теги вырезаются ДО схлопывания пробелов, иначе на их месте останутся двойные пробелы.
 * Это нормализация, а не защита: от XSS спасает экранирование на выводе.
 */
export const sanitizeInput = (value: string): string =>
	value
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
// #endregion

// #region VAL-16 | Асинхронная проверка
/**
 * Счётчик вызовов решает проблему гонки: пока летел запрос по 'ян', пользователь дописал 'яна',
 * и старый ответ уже не имеет смысла — его результат отбрасывается.
 * Кэш последнего значения убирает лишний запрос при потере фокуса и повторной проверке.
 */
export const createAsyncValidator = (
	check: (value: string) => Promise<boolean>,
	message: string
): ((value: string) => Promise<string | null>) => {
	let lastValue: string | null = null
	let lastResult: string | null = null
	let sequence = 0

	return async value => {
		if (value === lastValue) return lastResult

		const current = ++sequence
		const free = await check(value)
		if (current !== sequence) return null

		lastValue = value
		lastResult = free ? null : message
		return lastResult
	}
}
// #endregion
