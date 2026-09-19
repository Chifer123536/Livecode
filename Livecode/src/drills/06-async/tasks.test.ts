import { describe, expect, it, vi } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	batched,
	cached,
	cancellableDelay,
	createQueue,
	dedupe,
	delay,
	delayValue,
	eventLoopOrder,
	filterAsync,
	firstNonEmpty,
	latestOnly,
	makeCancellable,
	mapLimit,
	myAll,
	myAllSettled,
	myAny,
	myRace,
	parallel,
	poll,
	promisify,
	reduceAsync,
	retry,
	retryBackoff,
	safe,
	sequential,
	withTimeout,
} from './tasks'

/** Промис не должен завершиться за ms — используется для проверки отмены. */
const settlesWithin = async (promise: Promise<unknown>, ms: number) => {
	let settled = false
	promise.then(
		() => {
			settled = true
		},
		() => {
			settled = true
		}
	)
	await sleep(ms)
	return settled
}

// #region ASY-01
describe('ASY-01 delay', () => {
	it('ждёт указанное время', async () => {
		const started = Date.now()
		await delay(40)
		expect(Date.now() - started).toBeGreaterThanOrEqual(30)
	})
	it('резолвится без значения', async () => expect(await delay(1)).toBeUndefined())
})
// #endregion

// #region ASY-02
describe('ASY-02 delayValue', () => {
	it('возвращает значение', async () => expect(await delayValue('ок', 10)).toBe('ок'))
	it('работает с объектом', async () => expect(await delayValue({ a: 1 }, 5)).toEqual({ a: 1 }))
})
// #endregion

// #region ASY-03
describe('ASY-03 sequential', () => {
	it('строгий порядок выполнения', async () => {
		const order: number[] = []
		const task = (n: number, ms: number) => async () => {
			await sleep(ms)
			order.push(n)
			return n
		}
		const results = await sequential([task(1, 30), task(2, 10), task(3, 0)])
		expect(order).toEqual([1, 2, 3])
		expect(results).toEqual([1, 2, 3])
	})
	it('пустой список', async () => expect(await sequential([])).toEqual([]))
	it('задачи действительно не пересекаются', async () => {
		let running = 0
		let peak = 0
		const task = () => async () => {
			running += 1
			peak = Math.max(peak, running)
			await sleep(10)
			running -= 1
			return 0
		}
		await sequential([task(), task(), task()])
		expect(peak).toBe(1)
	})
})
// #endregion

// #region ASY-04
describe('ASY-04 parallel', () => {
	it('возвращает результаты в порядке входа', async () => {
		const task = (n: number, ms: number) => async () => {
			await sleep(ms)
			return n
		}
		expect(await parallel([task(1, 30), task(2, 5), task(3, 15)])).toEqual([1, 2, 3])
	})
	it('работает действительно параллельно', async () => {
		const started = Date.now()
		await parallel([() => sleep(40), () => sleep(40), () => sleep(40)])
		expect(Date.now() - started).toBeLessThan(110)
	})
	it('первая ошибка отклоняет всё', async () => {
		await expect(parallel([async () => 1, async () => Promise.reject(new Error('бум'))])).rejects.toThrow('бум')
	})
})
// #endregion

// #region ASY-05
describe('ASY-05 myAll', () => {
	it('сохраняет порядок при разной скорости', async () => {
		const result = await myAll([delayValue(1, 30), delayValue(2, 5), delayValue(3, 15)])
		expect(result).toEqual([1, 2, 3])
	})
	it('пустой массив резолвится сразу', async () => expect(await myAll([])).toEqual([]))
	it('отклоняется первой ошибкой', async () => {
		await expect(myAll([delayValue(1, 20), Promise.reject(new Error('бум'))])).rejects.toThrow('бум')
	})
})
// #endregion

// #region ASY-06
describe('ASY-06 myAllSettled', () => {
	it('собирает успехи и ошибки', async () => {
		const result = await myAllSettled([Promise.resolve(1), Promise.reject(new Error('бум'))])
		expect(result[0]).toEqual({ status: 'fulfilled', value: 1 })
		expect(result[1].status).toBe('rejected')
	})
	it('никогда не отклоняется', async () => {
		await expect(myAllSettled([Promise.reject(new Error('а')), Promise.reject(new Error('б'))])).resolves.toHaveLength(2)
	})
	it('пустой массив', async () => expect(await myAllSettled([])).toEqual([]))
})
// #endregion

// #region ASY-07
describe('ASY-07 myRace', () => {
	it('побеждает быстрейший', async () => {
		expect(await myRace([delayValue('медленно', 50), delayValue('быстро', 5)])).toBe('быстро')
	})
	it('быстрая ошибка тоже побеждает', async () => {
		const fast = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('быстрая ошибка')), 5))
		await expect(myRace([delayValue('ок', 50), fast])).rejects.toThrow('быстрая ошибка')
	})
})
// #endregion

// #region ASY-08
describe('ASY-08 myAny', () => {
	it('ждёт первый успех, игнорируя ранние ошибки', async () => {
		const failFast = new Promise<string>((_, reject) => setTimeout(() => reject(new Error('бум')), 5))
		expect(await myAny([failFast, delayValue('ок', 25)])).toBe('ок')
	})
	it('все упали — отклоняется', async () => {
		await expect(myAny([Promise.reject(new Error('а')), Promise.reject(new Error('б'))])).rejects.toThrow(
			'все промисы упали'
		)
	})
})
// #endregion

// #region ASY-09
describe('ASY-09 mapLimit', () => {
	it('соблюдает лимит и порядок', async () => {
		let running = 0
		let peak = 0
		const result = await mapLimit([1, 2, 3, 4, 5, 6], 2, async n => {
			running += 1
			peak = Math.max(peak, running)
			await sleep(15)
			running -= 1
			return n * 10
		})
		expect(result).toEqual([10, 20, 30, 40, 50, 60])
		expect(peak).toBe(2)
	})
	it('лимит больше длины', async () => {
		expect(await mapLimit([1, 2], 10, async n => n)).toEqual([1, 2])
	})
	it('пустой список', async () => expect(await mapLimit([], 3, async n => n)).toEqual([]))
	it('индекс передаётся в функцию', async () => {
		expect(await mapLimit(['a', 'b'], 1, async (item, index) => `${index}:${item}`)).toEqual(['0:a', '1:b'])
	})
})
// #endregion

// #region ASY-10
describe('ASY-10 retry', () => {
	it('успех со второй попытки', async () => {
		let calls = 0
		const result = await retry(async () => {
			calls += 1
			if (calls < 2) throw new Error('упало')
			return 'ок'
		}, 3, 1)
		expect(result).toBe('ок')
		expect(calls).toBe(2)
	})
	it('исчерпал попытки и пробросил ошибку', async () => {
		let calls = 0
		await expect(
			retry(async () => {
				calls += 1
				throw new Error('бум')
			}, 3, 1)
		).rejects.toThrow('бум')
		expect(calls).toBe(3)
	})
	it('успех с первой попытки не делает лишних вызовов', async () => {
		const fn = vi.fn(async () => 'ок')
		await retry(fn, 5, 1)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region ASY-11
describe('ASY-11 retryBackoff', () => {
	it('паузы удваиваются', async () => {
		const waits: number[] = []
		await expect(
			retryBackoff(
				async () => {
					throw new Error('бум')
				},
				4,
				1,
				wait => waits.push(wait)
			)
		).rejects.toThrow('бум')
		expect(waits).toEqual([1, 2, 4])
	})
	it('успех прекращает повторы', async () => {
		let calls = 0
		const result = await retryBackoff(
			async () => {
				calls += 1
				if (calls < 2) throw new Error('упало')
				return 'ок'
			},
			5,
			1
		)
		expect(result).toBe('ок')
		expect(calls).toBe(2)
	})
})
// #endregion

// #region ASY-12
describe('ASY-12 withTimeout', () => {
	it('медленный отклоняется', async () => {
		await expect(withTimeout(delayValue('поздно', 100), 20)).rejects.toThrow('timeout')
	})
	it('быстрый проходит', async () => expect(await withTimeout(delayValue('быстро', 5), 60)).toBe('быстро'))
	it('ошибка исходного промиса пробрасывается', async () => {
		await expect(withTimeout(Promise.reject(new Error('своя ошибка')), 50)).rejects.toThrow('своя ошибка')
	})
})
// #endregion

// #region ASY-13
describe('ASY-13 cancellableDelay', () => {
	it('резолвится, если не отменяли', async () => {
		const controller = new AbortController()
		await expect(cancellableDelay(10, controller.signal)).resolves.toBeUndefined()
	})
	it('отменяется по сигналу', async () => {
		const controller = new AbortController()
		const promise = cancellableDelay(100, controller.signal)
		controller.abort()
		await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
	})
	it('уже отменённый сигнал отклоняет сразу', async () => {
		const controller = new AbortController()
		controller.abort()
		await expect(cancellableDelay(100, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
	})
})
// #endregion

// #region ASY-14
describe('ASY-14 firstNonEmpty', () => {
	it('берёт первый непустой', async () => {
		const result = await firstNonEmpty([async () => null, async () => 'из CDN', async () => 'из базы'])
		expect(result).toBe('из CDN')
	})
	it('упавший источник пропускается', async () => {
		const result = await firstNonEmpty<string>([
			async () => {
				throw new Error('кэш недоступен')
			},
			async () => 'из базы',
		])
		expect(result).toBe('из базы')
	})
	it('все пустые — null', async () => {
		expect(await firstNonEmpty([async () => null, async () => null])).toBeNull()
	})
	it('не дёргает лишние источники', async () => {
		const second = vi.fn(async () => 'второй')
		await firstNonEmpty([async () => 'первый', second])
		expect(second).not.toHaveBeenCalled()
	})
})
// #endregion

// #region ASY-15
describe('ASY-15 dedupe', () => {
	it('параллельные вызовы с одним ключом делают один запрос', async () => {
		const fn = vi.fn(async (key: string) => {
			await sleep(20)
			return `результат ${key}`
		})
		const wrapped = dedupe(fn)
		const [a, b] = await Promise.all([wrapped('user'), wrapped('user')])
		expect(fn).toHaveBeenCalledTimes(1)
		expect(a).toBe(b)
	})
	it('разные ключи не схлопываются', async () => {
		const fn = vi.fn(async (key: string) => key)
		const wrapped = dedupe(fn)
		await Promise.all([wrapped('a'), wrapped('b')])
		expect(fn).toHaveBeenCalledTimes(2)
	})
	it('после завершения запрашивает заново', async () => {
		const fn = vi.fn(async (key: string) => key)
		const wrapped = dedupe(fn)
		await wrapped('a')
		await wrapped('a')
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
// #endregion

// #region ASY-16
describe('ASY-16 cached', () => {
	it('второй вызов берётся из кэша', async () => {
		const fn = vi.fn(async (key: string) => key)
		const wrapped = cached(fn, 1000)
		await wrapped('a')
		await wrapped('a')
		expect(fn).toHaveBeenCalledTimes(1)
	})
	it('протухшая запись перезапрашивается', async () => {
		const fn = vi.fn(async (key: string) => key)
		const wrapped = cached(fn, 20)
		await wrapped('a')
		await sleep(40)
		await wrapped('a')
		expect(fn).toHaveBeenCalledTimes(2)
	})
	it('ошибка не кэшируется', async () => {
		let calls = 0
		const wrapped = cached(async () => {
			calls += 1
			throw new Error('бум')
		}, 1000)
		await expect(wrapped('a')).rejects.toThrow('бум')
		await expect(wrapped('a')).rejects.toThrow('бум')
		expect(calls).toBe(2)
	})
})
// #endregion

// #region ASY-17
describe('ASY-17 createQueue', () => {
	it('выполняет строго по одной', async () => {
		const queue = createQueue()
		const order: number[] = []
		const task = (n: number, ms: number) => async () => {
			await sleep(ms)
			order.push(n)
			return n
		}
		await Promise.all([queue.add(task(1, 25)), queue.add(task(2, 5)), queue.add(task(3, 0))])
		expect(order).toEqual([1, 2, 3])
	})
	it('возвращает результат конкретной задачи', async () => {
		const queue = createQueue()
		expect(await queue.add(async () => 'значение')).toBe('значение')
	})
	it('упавшая задача не ломает очередь', async () => {
		const queue = createQueue()
		const failed = queue.add(async () => {
			throw new Error('бум')
		})
		await expect(failed).rejects.toThrow('бум')
		await expect(queue.add(async () => 'живой')).resolves.toBe('живой')
	})
})
// #endregion

// #region ASY-18
describe('ASY-18 promisify', () => {
	it('успех попадает в resolve', async () => {
		const nodeStyle = (arg: string, cb: (e: Error | null, r?: string) => void) => cb(null, `значение ${arg}`)
		expect(await promisify(nodeStyle)('x')).toBe('значение x')
	})
	it('ошибка попадает в reject', async () => {
		const nodeStyle = (_arg: string, cb: (e: Error | null, r?: string) => void) => cb(new Error('файла нет'))
		await expect(promisify(nodeStyle)('x')).rejects.toThrow('файла нет')
	})
})
// #endregion

// #region ASY-19
describe('ASY-19 safe', () => {
	it('успех даёт [null, data]', async () => expect(await safe(Promise.resolve(5))).toEqual([null, 5]))
	it('ошибка даёт [error, null]', async () => {
		const [error, data] = await safe(Promise.reject(new Error('бум')))
		expect(error?.message).toBe('бум')
		expect(data).toBeNull()
	})
	it('не бросает наружу', async () => {
		await expect(safe(Promise.reject(new Error('бум')))).resolves.toBeInstanceOf(Array)
	})
})
// #endregion

// #region ASY-20
describe('ASY-20 reduceAsync', () => {
	it('складывает по очереди', async () => {
		expect(await reduceAsync([1, 2, 3], async (acc, n) => acc + n, 0)).toBe(6)
	})
	it('передаёт индекс', async () => {
		expect(await reduceAsync(['a', 'b'], async (acc, item, i) => `${acc}${i}${item}`, '')).toBe('0a1b')
	})
	it('пустой список возвращает начальное', async () => {
		expect(await reduceAsync([] as number[], async acc => acc, 42)).toBe(42)
	})
})
// #endregion

// #region ASY-21
describe('ASY-21 filterAsync', () => {
	it('фильтрует по асинхронному предикату', async () => {
		expect(await filterAsync([1, 2, 3, 4], async n => n % 2 === 1)).toEqual([1, 3])
	})
	it('сохраняет порядок', async () => {
		const result = await filterAsync([1, 2, 3], async n => {
			await sleep(n === 1 ? 20 : 1)
			return true
		})
		expect(result).toEqual([1, 2, 3])
	})
	it('проверки идут параллельно', async () => {
		const started = Date.now()
		await filterAsync([1, 2, 3], async () => {
			await sleep(30)
			return true
		})
		expect(Date.now() - started).toBeLessThan(90)
	})
})
// #endregion

// #region ASY-22
describe('ASY-22 poll', () => {
	it('возвращает значение, когда условие выполнилось', async () => {
		let value = 0
		const result = await poll(async () => ++value, v => v >= 3, 5, 10)
		expect(result).toBe(3)
	})
	it('не дождался — отклоняется', async () => {
		await expect(poll(async () => 0, v => v === 1, 1, 3)).rejects.toThrow('опрос не дождался')
	})
	it('условие выполнено сразу — один вызов', async () => {
		const fn = vi.fn(async () => 'готово')
		await poll(fn, () => true, 100, 5)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region ASY-23
describe('ASY-23 makeCancellable', () => {
	it('без отмены работает как обычный промис', async () => {
		const { promise } = makeCancellable(delayValue('ок', 5))
		expect(await promise).toBe('ок')
	})
	it('после отмены не резолвится', async () => {
		const { promise, cancel } = makeCancellable(delayValue('ок', 10))
		cancel()
		expect(await settlesWithin(promise, 40)).toBe(false)
	})
	it('после отмены не отклоняется', async () => {
		const failing = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('бум')), 10))
		const { promise, cancel } = makeCancellable(failing)
		promise.catch(() => {})
		cancel()
		expect(await settlesWithin(promise, 40)).toBe(false)
	})
})
// #endregion

// #region ASY-24
describe('ASY-24 latestOnly', () => {
	it('результат устаревшего вызова отбрасывается', async () => {
		const wrapped = latestOnly(async (ms: number, value: string) => {
			await sleep(ms)
			return value
		})
		const slow = wrapped(40, 'старый')
		const fast = wrapped(5, 'новый')
		expect(await fast).toBe('новый')
		expect(await slow).toBeUndefined()
	})
	it('одиночный вызов работает как обычно', async () => {
		const wrapped = latestOnly(async (value: string) => value)
		expect(await wrapped('ок')).toBe('ок')
	})
})
// #endregion

// #region ASY-25
describe('ASY-25 batched', () => {
	it('схлопывает вызовы в один запрос', async () => {
		const loader = vi.fn(async (keys: number[]) => keys.map(key => `значение ${key}`))
		const load = batched(loader, 10)
		const results = await Promise.all([load(1), load(2), load(3)])
		expect(loader).toHaveBeenCalledTimes(1)
		expect(loader).toHaveBeenCalledWith([1, 2, 3])
		expect(results).toEqual(['значение 1', 'значение 2', 'значение 3'])
	})
	it('разные окна — разные запросы', async () => {
		const loader = vi.fn(async (keys: number[]) => keys.map(String))
		const load = batched(loader, 10)
		await load(1)
		await load(2)
		expect(loader).toHaveBeenCalledTimes(2)
	})
	it('ошибка загрузчика доходит до всех ожидающих', async () => {
		const load = batched(async () => {
			throw new Error('бум')
		}, 5)
		await expect(Promise.all([load(1), load(2)])).rejects.toThrow('бум')
	})
})
// #endregion

// #region ASY-26
describe('ASY-26 eventLoopOrder', () => {
	it('микрозадачи обгоняют макрозадачи', () => {
		expect(eventLoopOrder()).toEqual(['1', '5', '3', '4', '2'])
	})
	it('ответ совпадает с реальным поведением движка', async () => {
		const real: string[] = []
		real.push('1')
		setTimeout(() => real.push('2'), 0)
		Promise.resolve().then(() => real.push('3'))
		queueMicrotask(() => real.push('4'))
		real.push('5')
		await sleep(20)
		expect(eventLoopOrder()).toEqual(real)
	})
})
// #endregion
