import { describe, expect, it } from 'vitest'
import {
	abs,
	average,
	clamp,
	countdown,
	digitCount,
	factorial,
	fib,
	fizzbuzz,
	gcd,
	isEven,
	isLeapYear,
	isPerfectSquare,
	isPrime,
	max3,
	minMax,
	percent,
	range,
	reverseNumber,
	roundTo,
	secondsToTime,
	sign,
	sum,
	sumDigits,
	toBinary,
} from './tasks'

// #region BAS-01
describe('BAS-01 sum', () => {
	it('складывает положительные', () => expect(sum(2, 3)).toBe(5))
	it('складывает с отрицательным', () => expect(sum(-1, 1)).toBe(0))
	it('возвращает число, а не строку', () => expect(typeof sum(1, 2)).toBe('number'))
})
// #endregion

// #region BAS-02
describe('BAS-02 isEven', () => {
	it('чётное', () => expect(isEven(4)).toBe(true))
	it('нечётное', () => expect(isEven(7)).toBe(false))
	it('ноль чётный', () => expect(isEven(0)).toBe(true))
	it('отрицательное нечётное', () => expect(isEven(-3)).toBe(false))
	it('отрицательное чётное', () => expect(isEven(-4)).toBe(true))
})
// #endregion

// #region BAS-03
describe('BAS-03 max3', () => {
	it('находит максимум', () => expect(max3(1, 9, 5)).toBe(9))
	it('работает на отрицательных', () => expect(max3(-5, -2, -9)).toBe(-2))
	it('одинаковые значения', () => expect(max3(4, 4, 4)).toBe(4))
})
// #endregion

// #region BAS-04
describe('BAS-04 abs', () => {
	it('отрицательное', () => expect(abs(-7)).toBe(7))
	it('положительное', () => expect(abs(7)).toBe(7))
	it('ноль', () => expect(abs(0)).toBe(0))
})
// #endregion

// #region BAS-05
describe('BAS-05 clamp', () => {
	it('обрезает сверху', () => expect(clamp(15, 0, 10)).toBe(10))
	it('обрезает снизу', () => expect(clamp(-3, 0, 10)).toBe(0))
	it('оставляет внутри диапазона', () => expect(clamp(5, 0, 10)).toBe(5))
	it('границы включительно', () => expect(clamp(10, 0, 10)).toBe(10))
})
// #endregion

// #region BAS-06
describe('BAS-06 average', () => {
	it('считает среднее', () => expect(average([1, 2, 3, 4])).toBe(2.5))
	it('пустой массив даёт 0, а не NaN', () => expect(average([])).toBe(0))
	it('один элемент', () => expect(average([7])).toBe(7))
})
// #endregion

// #region BAS-07
describe('BAS-07 countdown', () => {
	it('считает вниз', () => expect(countdown(3)).toEqual([3, 2, 1]))
	it('ноль даёт пустой массив', () => expect(countdown(0)).toEqual([]))
	it('единица', () => expect(countdown(1)).toEqual([1]))
})
// #endregion

// #region BAS-08
describe('BAS-08 range', () => {
	it('шаг по умолчанию', () => expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]))
	it('произвольный шаг', () => expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]))
	it('пустой диапазон', () => expect(range(2, 2)).toEqual([]))
	it('to меньше from', () => expect(range(5, 1)).toEqual([]))
	it('шаг больше диапазона', () => expect(range(0, 2, 10)).toEqual([0]))
})
// #endregion

// #region BAS-09
describe('BAS-09 factorial', () => {
	it('5! = 120', () => expect(factorial(5)).toBe(120))
	it('0! = 1', () => expect(factorial(0)).toBe(1))
	it('1! = 1', () => expect(factorial(1)).toBe(1))
})
// #endregion

// #region BAS-10
describe('BAS-10 fizzbuzz', () => {
	it('первые пять', () => expect(fizzbuzz(5)).toEqual(['1', '2', 'Fizz', '4', 'Buzz']))
	it('15 даёт FizzBuzz последним', () => expect(fizzbuzz(15).at(-1)).toBe('FizzBuzz'))
	it('длина совпадает с n', () => expect(fizzbuzz(20)).toHaveLength(20))
	it('все элементы — строки', () => expect(fizzbuzz(5).every(v => typeof v === 'string')).toBe(true))
})
// #endregion

// #region BAS-11
describe('BAS-11 isPrime', () => {
	it('7 простое', () => expect(isPrime(7)).toBe(true))
	it('9 составное', () => expect(isPrime(9)).toBe(false))
	it('1 не простое', () => expect(isPrime(1)).toBe(false))
	it('2 простое', () => expect(isPrime(2)).toBe(true))
	it('отрицательные не простые', () => expect(isPrime(-7)).toBe(false))
	it('97 простое', () => expect(isPrime(97)).toBe(true))
})
// #endregion

// #region BAS-12
describe('BAS-12 digitCount', () => {
	it('четыре цифры', () => expect(digitCount(1305)).toBe(4))
	it('ноль — одна цифра', () => expect(digitCount(0)).toBe(1))
	it('минус не считается', () => expect(digitCount(-42)).toBe(2))
})
// #endregion

// #region BAS-13
describe('BAS-13 sumDigits', () => {
	it('1234 → 10', () => expect(sumDigits(1234)).toBe(10))
	it('знак игнорируется', () => expect(sumDigits(-45)).toBe(9))
	it('ноль', () => expect(sumDigits(0)).toBe(0))
})
// #endregion

// #region BAS-14
describe('BAS-14 reverseNumber', () => {
	it('обычное число', () => expect(reverseNumber(12345)).toBe(54321))
	it('ведущие нули отпадают', () => expect(reverseNumber(1200)).toBe(21))
	it('знак сохраняется', () => expect(reverseNumber(-123)).toBe(-321))
	it('однозначное', () => expect(reverseNumber(7)).toBe(7))
})
// #endregion

// #region BAS-15
describe('BAS-15 gcd', () => {
	it('12 и 18', () => expect(gcd(12, 18)).toBe(6))
	it('взаимно простые', () => expect(gcd(7, 13)).toBe(1))
	it('ноль в аргументе', () => expect(gcd(0, 5)).toBe(5))
	it('одинаковые', () => expect(gcd(9, 9)).toBe(9))
})
// #endregion

// #region BAS-16
describe('BAS-16 isLeapYear', () => {
	it('2024 високосный', () => expect(isLeapYear(2024)).toBe(true))
	it('1900 не високосный', () => expect(isLeapYear(1900)).toBe(false))
	it('2000 високосный', () => expect(isLeapYear(2000)).toBe(true))
	it('2023 не високосный', () => expect(isLeapYear(2023)).toBe(false))
})
// #endregion

// #region BAS-17
describe('BAS-17 roundTo', () => {
	it('два знака', () => expect(roundTo(3.14159, 2)).toBe(3.14))
	it('ловушка float: 1.005 не догоняет до 1.01', () => expect(roundTo(1.005, 2)).toBe(1))
	it('2.675 через умножение даёт 2.68', () => expect(roundTo(2.675, 2)).toBe(2.68))
	it('половина вверх по Math.round', () => expect(roundTo(-2.5, 0)).toBe(-2))
	it('целое без изменений', () => expect(roundTo(10, 2)).toBe(10))
	it('ноль знаков', () => expect(roundTo(3.7, 0)).toBe(4))
})
// #endregion

// #region BAS-18
describe('BAS-18 percent', () => {
	it('одна треть', () => expect(percent(1, 3)).toBe(33.3))
	it('четверть', () => expect(percent(50, 200)).toBe(25))
	it('деление на ноль', () => expect(percent(5, 0)).toBe(0))
	it('полный объём', () => expect(percent(7, 7)).toBe(100))
})
// #endregion

// #region BAS-19
describe('BAS-19 fib', () => {
	it('fib(0)', () => expect(fib(0)).toBe(0))
	it('fib(1)', () => expect(fib(1)).toBe(1))
	it('fib(10)', () => expect(fib(10)).toBe(55))
	it('fib(40) считается мгновенно', () => expect(fib(40)).toBe(102334155))
})
// #endregion

// #region BAS-20
describe('BAS-20 toBinary', () => {
	it('десять', () => expect(toBinary(10)).toBe('1010'))
	it('ноль', () => expect(toBinary(0)).toBe('0'))
	it('единица', () => expect(toBinary(1)).toBe('1'))
	it('255', () => expect(toBinary(255)).toBe('11111111'))
})
// #endregion

// #region BAS-21
describe('BAS-21 minMax', () => {
	it('находит обе границы', () => expect(minMax([3, 1, 4, 1, 5])).toEqual([1, 5]))
	it('один элемент', () => expect(minMax([7])).toEqual([7, 7]))
	it('пустой массив', () => expect(minMax([])).toBeNull())
	it('отрицательные', () => expect(minMax([-5, -1, -9])).toEqual([-9, -1]))
})
// #endregion

// #region BAS-22
describe('BAS-22 sign', () => {
	it('положительное', () => expect(sign(5)).toBe(1))
	it('отрицательное', () => expect(sign(-5)).toBe(-1))
	it('ноль', () => expect(sign(0)).toBe(0))
})
// #endregion

// #region BAS-23
describe('BAS-23 isPerfectSquare', () => {
	it('16', () => expect(isPerfectSquare(16)).toBe(true))
	it('15', () => expect(isPerfectSquare(15)).toBe(false))
	it('ноль', () => expect(isPerfectSquare(0)).toBe(true))
	it('отрицательное', () => expect(isPerfectSquare(-4)).toBe(false))
})
// #endregion

// #region BAS-24
describe('BAS-24 secondsToTime', () => {
	it('час с минутами', () => expect(secondsToTime(3669)).toBe('01:01:09'))
	it('меньше минуты', () => expect(secondsToTime(59)).toBe('00:00:59'))
	it('ноль', () => expect(secondsToTime(0)).toBe('00:00:00'))
	it('ровно сутки', () => expect(secondsToTime(86400)).toBe('24:00:00'))
})
// #endregion
