import { todo } from '../../shared/kit'

// #region BAS-01 | Сумма двух чисел | ★☆☆
/**
 * Вернуть сумму двух чисел.
 *
 *   sum(2, 3)  → 5
 *   sum(-1, 1) → 0
 */
export const sum = (a: number, b: number): number => todo()
// #endregion

// #region BAS-02 | Чётное число | ★☆☆
/**
 * Проверить, чётное ли число. Отрицательные тоже должны работать.
 *
 *   isEven(4)  → true
 *   isEven(-3) → false
 *   isEven(0)  → true
 */
export const isEven = (n: number): boolean => todo()
// #endregion

// #region BAS-03 | Максимум из трёх | ★☆☆
/**
 * Вернуть наибольшее из трёх чисел.
 *
 *   max3(1, 9, 5)    → 9
 *   max3(-5, -2, -9) → -2
 */
export const max3 = (a: number, b: number, c: number): number => todo()
// #endregion

// #region BAS-04 | Модуль числа | ★☆☆
/**
 * Модуль числа. Без Math.abs — нужен явный if или тернарник.
 *
 *   abs(-7) → 7
 *   abs(7)  → 7
 */
export const abs = (n: number): number => todo()
// #endregion

// #region BAS-05 | Зажать в диапазон | ★☆☆
/**
 * Вернуть n, но не выходящее за [min, max].
 * Реальный кейс: ограничить громкость, страницу пагинации, позицию слайдера.
 *
 *   clamp(15, 0, 10) → 10
 *   clamp(-3, 0, 10) → 0
 *   clamp(5, 0, 10)  → 5
 */
export const clamp = (n: number, min: number, max: number): number => todo()
// #endregion

// #region BAS-06 | Среднее арифметическое | ★☆☆
/**
 * Среднее по массиву. Пустой массив → 0 (а не NaN).
 *
 *   average([1, 2, 3, 4]) → 2.5
 *   average([])           → 0
 */
export const average = (nums: number[]): number => todo()
// #endregion

// #region BAS-07 | Обратный отсчёт | ★☆☆
/**
 * Массив от n до 1.
 *
 *   countdown(3) → [3, 2, 1]
 *   countdown(0) → []
 */
export const countdown = (n: number): number[] => todo()
// #endregion

// #region BAS-08 | Диапазон с шагом | ★★☆
/**
 * Числа от from (включая) до to (не включая) с шагом step.
 * Если шаг не передан — 1. Если диапазон пустой — пустой массив.
 *
 *   range(0, 5)     → [0, 1, 2, 3, 4]
 *   range(0, 10, 3) → [0, 3, 6, 9]
 *   range(2, 2)     → []
 */
export const range = (from: number, to: number, step?: number): number[] => todo()
// #endregion

// #region BAS-09 | Факториал | ★☆☆
/**
 * n! = 1 * 2 * ... * n. Ноль факториал равен единице.
 *
 *   factorial(5) → 120
 *   factorial(0) → 1
 */
export const factorial = (n: number): number => todo()
// #endregion

// #region BAS-10 | FizzBuzz | ★☆☆
/**
 * Числа от 1 до n строками, но кратные 3 → 'Fizz', кратные 5 → 'Buzz',
 * кратные и 3 и 5 → 'FizzBuzz'.
 *
 *   fizzbuzz(5) → ['1', '2', 'Fizz', '4', 'Buzz']
 */
export const fizzbuzz = (n: number): string[] => todo()
// #endregion

// #region BAS-11 | Простое число | ★★☆
/**
 * Простое ли число. Проверять делители до квадратного корня, а не до n.
 *
 *   isPrime(7) → true
 *   isPrime(9) → false
 *   isPrime(1) → false
 *   isPrime(2) → true
 */
export const isPrime = (n: number): boolean => todo()
// #endregion

// #region BAS-12 | Количество цифр | ★☆☆
/**
 * Сколько цифр в целом числе. Знак минуса не считается.
 *
 *   digitCount(1305) → 4
 *   digitCount(0)    → 1
 *   digitCount(-42)  → 2
 */
export const digitCount = (n: number): number => todo()
// #endregion

// #region BAS-13 | Сумма цифр | ★☆☆
/**
 * Сумма цифр целого числа. Знак игнорировать.
 *
 *   sumDigits(1234) → 10
 *   sumDigits(-45)  → 9
 *   sumDigits(0)    → 0
 */
export const sumDigits = (n: number): number => todo()
// #endregion

// #region BAS-14 | Перевернуть число | ★★☆
/**
 * Развернуть цифры числа. Знак сохранить, ведущие нули отбросить.
 *
 *   reverseNumber(12345) → 54321
 *   reverseNumber(1200)  → 21
 *   reverseNumber(-123)  → -321
 */
export const reverseNumber = (n: number): number => todo()
// #endregion

// #region BAS-15 | НОД | ★★☆
/**
 * Наибольший общий делитель (алгоритм Евклида).
 *
 *   gcd(12, 18) → 6
 *   gcd(7, 13)  → 1
 *   gcd(0, 5)   → 5
 */
export const gcd = (a: number, b: number): number => todo()
// #endregion

// #region BAS-16 | Високосный год | ★★☆
/**
 * Год високосный, если делится на 4, но НЕ на 100 — либо делится на 400.
 *
 *   isLeapYear(2024) → true
 *   isLeapYear(1900) → false
 *   isLeapYear(2000) → true
 */
export const isLeapYear = (year: number): boolean => todo()
// #endregion

// #region BAS-17 | Округление до N знаков | ★★☆
/**
 * Округлить до digits знаков после запятой способом «умножить → Math.round → разделить».
 * Половина уходит в сторону плюс бесконечности: -2.5 → -2.
 *
 *   roundTo(3.14159, 2) → 3.14
 *   roundTo(-2.5, 0)    → -2
 *   roundTo(10, 2)      → 10
 *   roundTo(1.005, 2)   → 1      // не 1.01 — см. разбор, это IEEE-754, а не баг
 */
export const roundTo = (n: number, digits: number): number => todo()
// #endregion

// #region BAS-18 | Процент | ★★☆
/**
 * Сколько процентов part составляет от total, округлить до одного знака.
 * Деление на ноль недопустимо: total === 0 → 0.
 *
 *   percent(1, 3)    → 33.3
 *   percent(50, 200) → 25
 *   percent(5, 0)    → 0
 */
export const percent = (part: number, total: number): number => todo()
// #endregion

// #region BAS-19 | Число Фибоначчи | ★★☆
/**
 * n-е число Фибоначчи, нумерация с нуля: 0, 1, 1, 2, 3, 5, 8...
 * Писать ИТЕРАТИВНО: наивная рекурсия — это O(2^n), на n = 40 ноутбук заплачет.
 *
 *   fib(0)  → 0
 *   fib(1)  → 1
 *   fib(10) → 55
 */
export const fib = (n: number): number => todo()
// #endregion

// #region BAS-20 | В двоичную систему | ★★☆
/**
 * Двоичное представление неотрицательного целого. Без toString(2).
 *
 *   toBinary(10) → '1010'
 *   toBinary(0)  → '0'
 *   toBinary(1)  → '1'
 */
export const toBinary = (n: number): string => todo()
// #endregion

// #region BAS-21 | Минимум и максимум за один проход | ★★☆
/**
 * Вернуть [min, max] одним проходом по массиву. Пустой массив → null.
 *
 *   minMax([3, 1, 4, 1, 5]) → [1, 5]
 *   minMax([7])             → [7, 7]
 *   minMax([])              → null
 */
export const minMax = (nums: number[]): [number, number] | null => todo()
// #endregion

// #region BAS-22 | Знак числа | ★☆☆
/**
 * Вернуть 1, -1 или 0. Без Math.sign.
 *
 *   sign(5)  → 1
 *   sign(-5) → -1
 *   sign(0)  → 0
 */
export const sign = (n: number): number => todo()
// #endregion

// #region BAS-23 | Полный квадрат | ★★☆
/**
 * Является ли число квадратом целого. Отрицательные — нет.
 *
 *   isPerfectSquare(16) → true
 *   isPerfectSquare(15) → false
 *   isPerfectSquare(0)  → true
 *   isPerfectSquare(-4) → false
 */
export const isPerfectSquare = (n: number): boolean => todo()
// #endregion

// #region BAS-24 | Секунды в часы:минуты:секунды | ★★☆
/**
 * Формат HH:MM:SS, всегда по две цифры. Часы могут перевалить за 99.
 * Реальный кейс: плеер, таймер, длительность звонка.
 *
 *   secondsToTime(3669) → '01:01:09'
 *   secondsToTime(59)   → '00:00:59'
 *   secondsToTime(0)    → '00:00:00'
 */
export const secondsToTime = (totalSeconds: number): string => todo()
// #endregion
