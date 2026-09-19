import { todo } from '../../shared/kit'

/**
 * ПРАВИЛА ПАКА
 * 1. Здесь ничего не реализуют — здесь ПРЕДСКАЗЫВАЮТ. Возвращай ответ, который ожидаешь.
 * 2. Сначала рассуждай вслух и только потом пиши. Угадал случайно — не считается.
 * 3. Тесты этого пака сверяют твой ответ с РЕАЛЬНЫМ выполнением того же кода,
 *    поэтому «правильный ответ» здесь не мнение автора, а поведение движка.
 * 4. Задачи 01-20 просят порядок вывода (массив строк),
 *    задачи 21-40 — значение выражения (строкой, как его напечатает String()).
 *
 * Шпаргалка по циклу событий:
 *   синхронный код → ВСЕ микрозадачи (промисы, queueMicrotask) → ОДНА макрозадача (setTimeout)
 *   → снова все микрозадачи → следующая макрозадача.
 */

// #region QZ-01 | Микрозадачи против макрозадач | ★☆☆
/**
 *   console.log('1')
 *   setTimeout(() => console.log('2'), 0)
 *   Promise.resolve().then(() => console.log('3'))
 *   console.log('4')
 */
export const qz01 = (): string[] => todo()
// #endregion

// #region QZ-02 | Исполнитель промиса синхронный | ★★☆
/**
 *   console.log('1')
 *   new Promise(resolve => { console.log('2'); resolve(undefined) }).then(() => console.log('3'))
 *   console.log('4')
 */
export const qz02 = (): string[] => todo()
// #endregion

// #region QZ-03 | Цепочка then | ★★☆
/**
 *   Promise.resolve().then(() => console.log('1')).then(() => console.log('2'))
 *   Promise.resolve().then(() => console.log('3')).then(() => console.log('4'))
 */
export const qz03 = (): string[] => todo()
// #endregion

// #region QZ-04 | Два таймера | ★☆☆
/**
 *   setTimeout(() => console.log('1'), 10)
 *   setTimeout(() => console.log('2'), 0)
 *   Promise.resolve().then(() => console.log('3'))
 *   console.log('4')
 */
export const qz04 = (): string[] => todo()
// #endregion

// #region QZ-05 | async/await | ★★★
/**
 *   async function run() {
 *     console.log('1')
 *     await null
 *     console.log('2')
 *   }
 *   console.log('0')
 *   run()
 *   console.log('3')
 *   Promise.resolve().then(() => console.log('4'))
 */
export const qz05 = (): string[] => todo()
// #endregion

// #region QZ-06 | Вложенные микрозадачи | ★★★
/**
 *   Promise.resolve().then(() => {
 *     console.log('1')
 *     Promise.resolve().then(() => console.log('2'))
 *   })
 *   Promise.resolve().then(() => console.log('3'))
 */
export const qz06 = (): string[] => todo()
// #endregion

// #region QZ-07 | queueMicrotask и then | ★★☆
/**
 *   queueMicrotask(() => console.log('1'))
 *   Promise.resolve().then(() => console.log('2'))
 *   queueMicrotask(() => console.log('3'))
 */
export const qz07 = (): string[] => todo()
// #endregion

// #region QZ-08 | Микрозадача внутри таймера | ★★★
/**
 *   setTimeout(() => {
 *     console.log('1')
 *     Promise.resolve().then(() => console.log('2'))
 *   }, 0)
 *   setTimeout(() => console.log('3'), 0)
 */
export const qz08 = (): string[] => todo()
// #endregion

// #region QZ-09 | var в цикле с таймером | ★★☆
/**
 *   for (var i = 0; i < 3; i++) setTimeout(() => console.log(String(i)), 0)
 */
export const qz09 = (): string[] => todo()
// #endregion

// #region QZ-10 | let в цикле с таймером | ★★☆
/**
 *   for (let i = 0; i < 3; i++) setTimeout(() => console.log(String(i)), 0)
 */
export const qz10 = (): string[] => todo()
// #endregion

// #region QZ-11 | await в цикле | ★★★
/**
 *   async function run() {
 *     for (const n of [1, 2]) {
 *       await null
 *       console.log(String(n))
 *     }
 *   }
 *   run()
 *   Promise.resolve().then(() => console.log('микро'))
 */
export const qz11 = (): string[] => todo()
// #endregion

// #region QZ-12 | Ошибка в then | ★★★
/**
 *   Promise.reject(new Error('бум'))
 *     .then(() => console.log('then'))
 *     .catch(() => console.log('catch'))
 *     .finally(() => console.log('finally'))
 */
export const qz12 = (): string[] => todo()
// #endregion

// #region QZ-13 | Возврат промиса из then | ★★★
/**
 *   Promise.resolve()
 *     .then(() => { console.log('1'); return Promise.resolve() })
 *     .then(() => console.log('2'))
 *   Promise.resolve()
 *     .then(() => console.log('3'))
 *     .then(() => console.log('4'))
 *     .then(() => console.log('5'))
 */
export const qz13 = (): string[] => todo()
// #endregion

// #region QZ-14 | Hoisting функции и переменной | ★★☆
/**
 *   console.log(typeof fn)
 *   console.log(typeof value)
 *   function fn() {}
 *   var value = 1
 */
export const qz14 = (): string[] => todo()
// #endregion

// #region QZ-15 | Порядок объявлений | ★★☆
/**
 *   var x = 1
 *   function show() {
 *     console.log(String(x))
 *     var x = 2
 *   }
 *   show()
 */
export const qz15 = (): string[] => todo()
// #endregion

// #region QZ-16 | this в методе и в оторванной функции | ★★☆
/**
 * В строгом режиме (ES-модуль):
 *
 *   const obj = { name: 'obj', getName() { return this?.name } }
 *   console.log(String(obj.getName()))
 *   const loose = obj.getName
 *   console.log(String(loose()))
 */
export const qz16 = (): string[] => todo()
// #endregion

// #region QZ-17 | this в стрелке внутри метода | ★★★
/**
 *   const obj = {
 *     name: 'obj',
 *     regular() {
 *       const arrow = () => this?.name
 *       return arrow()
 *     },
 *     arrowMethod: function () {
 *       return [1].map(function () { return this?.name })[0]
 *     },
 *   }
 *   console.log(String(obj.regular()))
 *   console.log(String(obj.arrowMethod()))
 */
export const qz17 = (): string[] => todo()
// #endregion

// #region QZ-18 | Замыкание в цикле с массивом функций | ★★☆
/**
 *   const fns = []
 *   for (var i = 0; i < 3; i++) fns.push(() => i)
 *   console.log(fns.map(f => String(f())).join(','))
 */
export const qz18 = (): string[] => todo()
// #endregion

// #region QZ-19 | Порядок в классе | ★★☆
/**
 *   class A { constructor() { console.log('A') } }
 *   class B extends A { constructor() { console.log('до super'); super(); console.log('после super') } }
 *   new B()
 */
export const qz19 = (): string[] => todo()
// #endregion

// #region QZ-20 | try/catch/finally с return | ★★★
/**
 *   function run() {
 *     try { console.log('try'); return 'из try' }
 *     finally { console.log('finally') }
 *   }
 *   console.log(run())
 */
export const qz20 = (): string[] => todo()
// #endregion

// #region QZ-21 | typeof null | ★☆☆
/** Что вернёт `typeof null`? */
export const qz21 = (): string => todo()
// #endregion

// #region QZ-22 | Сложение дробей | ★☆☆
/** Что напечатает `0.1 + 0.2`? Ответ строкой, как его покажет String(). */
export const qz22 = (): string => todo()
// #endregion

// #region QZ-23 | Плюс со строкой | ★☆☆
/** Значение `'5' + 3`. */
export const qz23 = (): string => todo()
// #endregion

// #region QZ-24 | Минус со строкой | ★☆☆
/** Значение `'5' - 3`. */
export const qz24 = (): string => todo()
// #endregion

// #region QZ-25 | Массив плюс объект | ★★☆
/** Значение `[] + {}`. */
export const qz25 = (): string => todo()
// #endregion

// #region QZ-26 | Пустые массивы | ★★☆
/** Значение `[] + []`. */
export const qz26 = (): string => todo()
// #endregion

// #region QZ-27 | Массив с числами плюс строка | ★★☆
/** Значение `[1, 2] + [3]`. */
export const qz27 = (): string => todo()
// #endregion

// #region QZ-28 | Нестрогое равенство с массивом | ★★★
/** Значение `[] == false`. */
export const qz28 = (): string => todo()
// #endregion

// #region QZ-29 | Массив против своего отрицания | ★★★
/** Значение `[] == ![]`. */
export const qz29 = (): string => todo()
// #endregion

// #region QZ-30 | null и undefined | ★★☆
/** Значение `null == undefined`. */
export const qz30 = (): string => todo()
// #endregion

// #region QZ-31 | Строгое сравнение null и undefined | ★☆☆
/** Значение `null === undefined`. */
export const qz31 = (): string => todo()
// #endregion

// #region QZ-32 | NaN сам с собой | ★☆☆
/** Значение `NaN === NaN`. */
export const qz32 = (): string => todo()
// #endregion

// #region QZ-33 | Ноль и строка | ★★☆
/** Значение `'0' == false`. */
export const qz33 = (): string => todo()
// #endregion

// #region QZ-34 | Цепочка сравнений | ★★★
/** Значение `3 > 2 > 1`. */
export const qz34 = (): string => todo()
// #endregion

// #region QZ-35 | Сортировка чисел по умолчанию | ★★☆
/** Значение `[10, 9, 1].sort().join(',')`. */
export const qz35 = (): string => todo()
// #endregion

// #region QZ-36 | map с parseInt | ★★★
/** Значение `['1', '2', '3'].map(parseInt).join(',')`. */
export const qz36 = (): string => todo()
// #endregion

// #region QZ-37 | Math.max без аргументов | ★★☆
/** Значение `Math.max()`. */
export const qz37 = (): string => todo()
// #endregion

// #region QZ-38 | Банан | ★★★
/** Значение `'b' + 'a' + +'a' + 'a'`. */
export const qz38 = (): string => todo()
// #endregion

// #region QZ-39 | Непустая строка в булев | ★★☆
/** Значение `Boolean('false')`. */
export const qz39 = (): string => todo()
// #endregion

// #region QZ-40 | typeof NaN | ★☆☆
/** Значение `typeof NaN`. */
export const qz40 = (): string => todo()
// #endregion
