import { describe, expect, it } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	qz01, qz02, qz03, qz04, qz05, qz06, qz07, qz08, qz09, qz10,
	qz11, qz12, qz13, qz14, qz15, qz16, qz17, qz18, qz19, qz20,
	qz21, qz22, qz23, qz24, qz25, qz26, qz27, qz28, qz29, qz30,
	qz31, qz32, qz33, qz34, qz35, qz36, qz37, qz38, qz39, qz40,
} from './tasks'

/**
 * Тесты этого пака не сверяют ответ с мнением автора — они ВЫПОЛНЯЮТ тот же код
 * и сравнивают с реальным поведением движка. Плюс фиксируют ожидаемый ответ,
 * чтобы ошибка в разборе тоже всплыла.
 */
async function run(body: (log: (value: unknown) => void) => void): Promise<string[]> {
	const output: string[] = []
	body(value => output.push(String(value)))
	await sleep(40)
	return output
}

/**
 * Кривые операции прячем за функциями с any. Иначе компилятор вычисляет результат
 * заранее и ругается «это условие всегда ложно» — а нам нужно именно поведение рантайма.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const loosePlus = (a: any, b: any): string => String(a + b)
const looseEq = (a: any, b: any): boolean => a == b
const looseGt = (a: any, b: any): boolean => a > b
const looseNot = (a: any): boolean => !a
const strictEq = (a: any, b: any): boolean => a === b
/* eslint-enable @typescript-eslint/no-explicit-any */

// #region QZ-01
describe('QZ-01 микрозадачи против макрозадач', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			log('1')
			setTimeout(() => log('2'), 0)
			Promise.resolve().then(() => log('3'))
			log('4')
		})
		expect(real).toEqual(['1', '4', '3', '2'])
		expect(qz01()).toEqual(real)
	})
})
// #endregion

// #region QZ-02
describe('QZ-02 исполнитель промиса синхронный', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			log('1')
			new Promise<void>(resolve => {
				log('2')
				resolve()
			}).then(() => log('3'))
			log('4')
		})
		expect(real).toEqual(['1', '2', '4', '3'])
		expect(qz02()).toEqual(real)
	})
})
// #endregion

// #region QZ-03
describe('QZ-03 цепочка then', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			Promise.resolve()
				.then(() => log('1'))
				.then(() => log('2'))
			Promise.resolve()
				.then(() => log('3'))
				.then(() => log('4'))
		})
		expect(real).toEqual(['1', '3', '2', '4'])
		expect(qz03()).toEqual(real)
	})
})
// #endregion

// #region QZ-04
describe('QZ-04 два таймера', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			setTimeout(() => log('1'), 10)
			setTimeout(() => log('2'), 0)
			Promise.resolve().then(() => log('3'))
			log('4')
		})
		expect(real).toEqual(['4', '3', '2', '1'])
		expect(qz04()).toEqual(real)
	})
})
// #endregion

// #region QZ-05
describe('QZ-05 async/await', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const task = async () => {
				log('1')
				await null
				log('2')
			}
			log('0')
			void task()
			log('3')
			Promise.resolve().then(() => log('4'))
		})
		expect(real).toEqual(['0', '1', '3', '2', '4'])
		expect(qz05()).toEqual(real)
	})
})
// #endregion

// #region QZ-06
describe('QZ-06 вложенные микрозадачи', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			Promise.resolve().then(() => {
				log('1')
				Promise.resolve().then(() => log('2'))
			})
			Promise.resolve().then(() => log('3'))
		})
		expect(real).toEqual(['1', '3', '2'])
		expect(qz06()).toEqual(real)
	})
})
// #endregion

// #region QZ-07
describe('QZ-07 queueMicrotask и then', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			queueMicrotask(() => log('1'))
			Promise.resolve().then(() => log('2'))
			queueMicrotask(() => log('3'))
		})
		expect(real).toEqual(['1', '2', '3'])
		expect(qz07()).toEqual(real)
	})
})
// #endregion

// #region QZ-08
describe('QZ-08 микрозадача внутри таймера', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			setTimeout(() => {
				log('1')
				Promise.resolve().then(() => log('2'))
			}, 0)
			setTimeout(() => log('3'), 0)
		})
		expect(real).toEqual(['1', '2', '3'])
		expect(qz08()).toEqual(real)
	})
})
// #endregion

// #region QZ-09
describe('QZ-09 var в цикле с таймером', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			// eslint-disable-next-line no-var
			for (var i = 0; i < 3; i++) setTimeout(() => log(String(i)), 0)
		})
		expect(real).toEqual(['3', '3', '3'])
		expect(qz09()).toEqual(real)
	})
})
// #endregion

// #region QZ-10
describe('QZ-10 let в цикле с таймером', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			for (let i = 0; i < 3; i++) setTimeout(() => log(String(i)), 0)
		})
		expect(real).toEqual(['0', '1', '2'])
		expect(qz10()).toEqual(real)
	})
})
// #endregion

// #region QZ-11
describe('QZ-11 await в цикле', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const task = async () => {
				for (const n of [1, 2]) {
					await null
					log(String(n))
				}
			}
			void task()
			Promise.resolve().then(() => log('микро'))
		})
		expect(real).toEqual(['1', 'микро', '2'])
		expect(qz11()).toEqual(real)
	})
})
// #endregion

// #region QZ-12
describe('QZ-12 ошибка в then', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			Promise.reject(new Error('бум'))
				.then(() => log('then'))
				.catch(() => log('catch'))
				.finally(() => log('finally'))
		})
		expect(real).toEqual(['catch', 'finally'])
		expect(qz12()).toEqual(real)
	})
})
// #endregion

// #region QZ-13
describe('QZ-13 возврат промиса из then', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			Promise.resolve()
				.then(() => {
					log('1')
					return Promise.resolve()
				})
				.then(() => log('2'))
			Promise.resolve()
				.then(() => log('3'))
				.then(() => log('4'))
				.then(() => log('5'))
		})
		expect(real).toEqual(['1', '3', '4', '5', '2'])
		expect(qz13()).toEqual(real)
	})
})
// #endregion

// #region QZ-14
describe('QZ-14 hoisting функции и переменной', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			log(typeof fn)
			// @ts-expect-error намеренно читаем var до присваивания — в этом и суть задачи
			log(typeof value)
			function fn() {}
			// eslint-disable-next-line no-var
			var value = 1
			void value
		})
		expect(real).toEqual(['function', 'undefined'])
		expect(qz14()).toEqual(real)
	})
})
// #endregion

// #region QZ-15
describe('QZ-15 порядок объявлений', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			// eslint-disable-next-line no-var
			var x = 1
			void x
			function show() {
				// @ts-expect-error намеренно читаем затенённую var до присваивания
				log(String(x))
				// eslint-disable-next-line no-var
				var x = 2
				void x
			}
			show()
		})
		expect(real).toEqual(['undefined'])
		expect(qz15()).toEqual(real)
	})
})
// #endregion

// #region QZ-16
describe('QZ-16 this в методе и в оторванной функции', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const obj = {
				name: 'obj',
				getName(this: { name: string } | undefined) {
					return this?.name
				},
			}
			log(String(obj.getName()))
			const loose = obj.getName as unknown as () => string | undefined
			log(String(loose()))
		})
		expect(real).toEqual(['obj', 'undefined'])
		expect(qz16()).toEqual(real)
	})
})
// #endregion

// #region QZ-17
describe('QZ-17 this в стрелке внутри метода', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const obj = {
				name: 'obj',
				regular(this: { name: string }) {
					const arrow = () => this?.name
					return arrow()
				},
				arrowMethod: function () {
					return [1].map(function (this: { name: string } | undefined) {
						return this?.name
					})[0]
				},
			}
			log(String(obj.regular()))
			log(String(obj.arrowMethod()))
		})
		expect(real).toEqual(['obj', 'undefined'])
		expect(qz17()).toEqual(real)
	})
})
// #endregion

// #region QZ-18
describe('QZ-18 замыкание в цикле с массивом функций', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const fns: Array<() => number> = []
			// eslint-disable-next-line no-var
			for (var i = 0; i < 3; i++) fns.push(() => i)
			log(fns.map(f => String(f())).join(','))
		})
		expect(real).toEqual(['3,3,3'])
		expect(qz18()).toEqual(real)
	})
})
// #endregion

// #region QZ-19
describe('QZ-19 порядок в классе', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			class A {
				constructor() {
					log('A')
				}
			}
			class B extends A {
				constructor() {
					log('до super')
					super()
					log('после super')
				}
			}
			void new B()
		})
		expect(real).toEqual(['до super', 'A', 'после super'])
		expect(qz19()).toEqual(real)
	})
})
// #endregion

// #region QZ-20
describe('QZ-20 try/catch/finally с return', () => {
	it('совпадает с реальным выполнением', async () => {
		const real = await run(log => {
			const task = () => {
				try {
					log('try')
					return 'из try'
				} finally {
					log('finally')
				}
			}
			log(task())
		})
		expect(real).toEqual(['try', 'finally', 'из try'])
		expect(qz20()).toEqual(real)
	})
})
// #endregion

// #region QZ-21
describe('QZ-21 typeof null', () => {
	it('совпадает с реальным значением', () => {
		expect(qz21()).toBe('object')
		expect(qz21()).toBe(typeof null)
	})
})
// #endregion

// #region QZ-22
describe('QZ-22 сложение дробей', () => {
	it('совпадает с реальным значением', () => {
		expect(qz22()).toBe('0.30000000000000004')
		expect(qz22()).toBe(String(0.1 + 0.2))
	})
})
// #endregion

// #region QZ-23
describe('QZ-23 плюс со строкой', () => {
	it('совпадает с реальным значением', () => {
		expect(qz23()).toBe('53')
		expect(qz23()).toBe(String('5' + 3))
	})
})
// #endregion

// #region QZ-24
describe('QZ-24 минус со строкой', () => {
	it('совпадает с реальным значением', () => {
		expect(qz24()).toBe('2')
		expect(qz24()).toBe(String((('5' as unknown) as number) * 1 - 3))
	})
})
// #endregion

// #region QZ-25
describe('QZ-25 массив плюс объект', () => {
	it('совпадает с реальным значением', () => {
		expect(qz25()).toBe('[object Object]')
		expect(qz25()).toBe(loosePlus([], {}))
	})
})
// #endregion

// #region QZ-26
describe('QZ-26 пустые массивы', () => {
	it('совпадает с реальным значением', () => {
		expect(qz26()).toBe('')
		expect(qz26()).toBe(loosePlus([], []))
	})
})
// #endregion

// #region QZ-27
describe('QZ-27 массив с числами плюс строка', () => {
	it('совпадает с реальным значением', () => {
		expect(qz27()).toBe('1,23')
		expect(qz27()).toBe(loosePlus([1, 2], [3]))
	})
})
// #endregion

// #region QZ-28
describe('QZ-28 нестрогое равенство с массивом', () => {
	it('совпадает с реальным значением', () => {
		expect(qz28()).toBe('true')
		expect(qz28()).toBe(String(looseEq([], false)))
	})
})
// #endregion

// #region QZ-29
describe('QZ-29 массив против своего отрицания', () => {
	it('совпадает с реальным значением', () => {
		expect(qz29()).toBe('true')
		expect(qz29()).toBe(String(looseEq([], looseNot([]))))
	})
})
// #endregion

// #region QZ-30
describe('QZ-30 null и undefined', () => {
	it('совпадает с реальным значением', () => {
		expect(qz30()).toBe('true')
		expect(qz30()).toBe(String(null == undefined))
	})
})
// #endregion

// #region QZ-31
describe('QZ-31 строгое сравнение null и undefined', () => {
	it('совпадает с реальным значением', () => {
		expect(qz31()).toBe('false')
		expect(qz31()).toBe(String(Object.is(null, undefined)))
	})
})
// #endregion

// #region QZ-32
describe('QZ-32 NaN сам с собой', () => {
	it('совпадает с реальным значением', () => {
		expect(qz32()).toBe('false')
		expect(qz32()).toBe(String(strictEq(NaN, NaN)))
	})
})
// #endregion

// #region QZ-33
describe('QZ-33 ноль и строка', () => {
	it('совпадает с реальным значением', () => {
		expect(qz33()).toBe('true')
		expect(qz33()).toBe(String(looseEq('0', false)))
	})
})
// #endregion

// #region QZ-34
describe('QZ-34 цепочка сравнений', () => {
	it('совпадает с реальным значением', () => {
		expect(qz34()).toBe('false')
		expect(qz34()).toBe(String(looseGt(looseGt(3, 2), 1)))
	})
})
// #endregion

// #region QZ-35
describe('QZ-35 сортировка чисел по умолчанию', () => {
	it('совпадает с реальным значением', () => {
		expect(qz35()).toBe('1,10,9')
		expect(qz35()).toBe([10, 9, 1].sort().join(','))
	})
})
// #endregion

// #region QZ-36
describe('QZ-36 map с parseInt', () => {
	it('совпадает с реальным значением', () => {
		expect(qz36()).toBe('1,NaN,NaN')
		expect(qz36()).toBe(['1', '2', '3'].map(parseInt).join(','))
	})
})
// #endregion

// #region QZ-37
describe('QZ-37 Math.max без аргументов', () => {
	it('совпадает с реальным значением', () => {
		expect(qz37()).toBe('-Infinity')
		expect(qz37()).toBe(String(Math.max()))
	})
})
// #endregion

// #region QZ-38
describe('QZ-38 банан', () => {
	it('совпадает с реальным значением', () => {
		expect(qz38()).toBe('baNaNa')
		expect(qz38()).toBe(String('b' + 'a' + +'a' + 'a'))
	})
})
// #endregion

// #region QZ-39
describe('QZ-39 непустая строка в булев', () => {
	it('совпадает с реальным значением', () => {
		expect(qz39()).toBe('true')
		expect(qz39()).toBe(String(Boolean('false')))
	})
})
// #endregion

// #region QZ-40
describe('QZ-40 typeof NaN', () => {
	it('совпадает с реальным значением', () => {
		expect(qz40()).toBe('number')
		expect(qz40()).toBe(typeof NaN)
	})
})
// #endregion
