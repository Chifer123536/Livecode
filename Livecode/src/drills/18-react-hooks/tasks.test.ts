// @vitest-environment happy-dom
import { act, cleanup, fireEvent, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	useAsync,
	useClickOutside,
	useCopyToClipboard,
	useCounter,
	useDebounce,
	useDebouncedCallback,
	useEventListener,
	useFetchJson,
	useForm,
	useInput,
	useInterval,
	useIsMounted,
	useKeyPress,
	useLatest,
	useLocalStorage,
	useMediaQuery,
	useOnlineStatus,
	usePagination,
	usePrevious,
	useSelection,
	useStateWithHistory,
	useThrottledCallback,
	useTimeout,
	useToggle,
	useUpdateEffect,
	useWindowSize,
} from './tasks'

afterEach(() => {
	cleanup()
	vi.useRealTimers()
	vi.unstubAllGlobals()
	window.localStorage.clear()
})

// #region RH-01
describe('RH-01 useToggle', () => {
	it('стартует с начального значения', () => {
		const { result } = renderHook(() => useToggle(true))
		expect(result.current[0]).toBe(true)
	})
	it('переключает', () => {
		const { result } = renderHook(() => useToggle())
		act(() => result.current[1]())
		expect(result.current[0]).toBe(true)
		act(() => result.current[1]())
		expect(result.current[0]).toBe(false)
	})
	it('можно выставить значение явно', () => {
		const { result } = renderHook(() => useToggle())
		act(() => result.current[2](true))
		expect(result.current[0]).toBe(true)
	})
	it('toggle стабилен между рендерами', () => {
		const { result, rerender } = renderHook(() => useToggle())
		const first = result.current[1]
		rerender()
		expect(result.current[1]).toBe(first)
	})
})
// #endregion

// #region RH-02
describe('RH-02 useCounter', () => {
	it('инкремент и декремент', () => {
		const { result } = renderHook(() => useCounter(5))
		act(() => result.current.inc())
		expect(result.current.count).toBe(6)
		act(() => result.current.dec())
		expect(result.current.count).toBe(5)
	})
	it('не уходит ниже min', () => {
		const { result } = renderHook(() => useCounter(0, { min: 0 }))
		act(() => result.current.dec())
		expect(result.current.count).toBe(0)
	})
	it('не уходит выше max', () => {
		const { result } = renderHook(() => useCounter(9, { max: 10 }))
		act(() => {
			result.current.inc()
			result.current.inc()
		})
		expect(result.current.count).toBe(10)
	})
	it('set зажимается границами', () => {
		const { result } = renderHook(() => useCounter(0, { min: 0, max: 5 }))
		act(() => result.current.set(99))
		expect(result.current.count).toBe(5)
	})
	it('reset возвращает начальное', () => {
		const { result } = renderHook(() => useCounter(3))
		act(() => result.current.inc())
		act(() => result.current.reset())
		expect(result.current.count).toBe(3)
	})
})
// #endregion

// #region RH-03
describe('RH-03 useInput', () => {
	it('меняет значение по событию', () => {
		const { result } = renderHook(() => useInput())
		act(() => result.current.onChange({ target: { value: 'привет' } }))
		expect(result.current.value).toBe('привет')
	})
	it('reset возвращает начальное', () => {
		const { result } = renderHook(() => useInput('старт'))
		act(() => result.current.onChange({ target: { value: 'другое' } }))
		act(() => result.current.reset())
		expect(result.current.value).toBe('старт')
	})
})
// #endregion

// #region RH-04
describe('RH-04 usePrevious', () => {
	it('на первом рендере undefined', () => {
		const { result } = renderHook(({ value }) => usePrevious(value), { initialProps: { value: 1 } })
		expect(result.current).toBeUndefined()
	})
	it('отдаёт значение прошлого рендера', () => {
		const { result, rerender } = renderHook(({ value }) => usePrevious(value), { initialProps: { value: 1 } })
		rerender({ value: 2 })
		expect(result.current).toBe(1)
		rerender({ value: 3 })
		expect(result.current).toBe(2)
	})
})
// #endregion

// #region RH-05
describe('RH-05 useUpdateEffect', () => {
	it('не вызывается на первом рендере', () => {
		const effect = vi.fn()
		renderHook(({ value }) => useUpdateEffect(effect, [value]), { initialProps: { value: 1 } })
		expect(effect).not.toHaveBeenCalled()
	})
	it('вызывается при изменении зависимостей', () => {
		const effect = vi.fn()
		const { rerender } = renderHook(({ value }) => useUpdateEffect(effect, [value]), { initialProps: { value: 1 } })
		rerender({ value: 2 })
		expect(effect).toHaveBeenCalledTimes(1)
		rerender({ value: 3 })
		expect(effect).toHaveBeenCalledTimes(2)
	})
	it('не вызывается, когда зависимости не менялись', () => {
		const effect = vi.fn()
		const { rerender } = renderHook(({ value }) => useUpdateEffect(effect, [value]), { initialProps: { value: 1 } })
		rerender({ value: 1 })
		expect(effect).not.toHaveBeenCalled()
	})
})
// #endregion

// #region RH-06
describe('RH-06 useIsMounted', () => {
	it('после монтирования true', () => {
		const { result } = renderHook(() => useIsMounted())
		expect(result.current()).toBe(true)
	})
	it('после размонтирования false', () => {
		const { result, unmount } = renderHook(() => useIsMounted())
		const isMounted = result.current
		unmount()
		expect(isMounted()).toBe(false)
	})
})
// #endregion

// #region RH-07
describe('RH-07 useLatest', () => {
	it('всегда содержит свежее значение', () => {
		const { result, rerender } = renderHook(({ value }) => useLatest(value), { initialProps: { value: 'a' } })
		expect(result.current.current).toBe('a')
		rerender({ value: 'b' })
		expect(result.current.current).toBe('b')
	})
	it('ссылка на ref не меняется', () => {
		const { result, rerender } = renderHook(({ value }) => useLatest(value), { initialProps: { value: 1 } })
		const ref = result.current
		rerender({ value: 2 })
		expect(result.current).toBe(ref)
	})
})
// #endregion

// #region RH-08
describe('RH-08 useDebounce', () => {
	beforeEach(() => vi.useFakeTimers())

	it('сразу отдаёт начальное значение', () => {
		const { result } = renderHook(() => useDebounce('a', 300))
		expect(result.current).toBe('a')
	})
	it('обновляется только после паузы', async () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } })
		rerender({ value: 'b' })
		expect(result.current).toBe('a')
		await act(async () => {
			await vi.advanceTimersByTimeAsync(300)
		})
		expect(result.current).toBe('b')
	})
	it('быстрые изменения схлопываются в одно', async () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } })
		rerender({ value: 'b' })
		await act(async () => {
			await vi.advanceTimersByTimeAsync(200)
		})
		rerender({ value: 'c' })
		await act(async () => {
			await vi.advanceTimersByTimeAsync(200)
		})
		expect(result.current).toBe('a')
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100)
		})
		expect(result.current).toBe('c')
	})
})
// #endregion

// #region RH-09
describe('RH-09 useDebouncedCallback', () => {
	beforeEach(() => vi.useFakeTimers())

	it('вызывает один раз после паузы', async () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useDebouncedCallback(fn, 200))
		act(() => {
			result.current('a')
			result.current('b')
			result.current('c')
		})
		expect(fn).not.toHaveBeenCalled()
		await act(async () => {
			await vi.advanceTimersByTimeAsync(200)
		})
		expect(fn).toHaveBeenCalledTimes(1)
		expect(fn).toHaveBeenCalledWith('c')
	})
	it('возвращает стабильную ссылку', () => {
		const { result, rerender } = renderHook(({ fn }) => useDebouncedCallback(fn, 200), {
			initialProps: { fn: vi.fn() },
		})
		const first = result.current
		rerender({ fn: vi.fn() })
		expect(result.current).toBe(first)
	})
	it('зовёт свежую версию функции', async () => {
		const first = vi.fn()
		const second = vi.fn()
		const { result, rerender } = renderHook(({ fn }) => useDebouncedCallback(fn, 100), {
			initialProps: { fn: first },
		})
		act(() => result.current('x'))
		rerender({ fn: second })
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100)
		})
		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledWith('x')
	})
	it('после размонтирования не стреляет', async () => {
		const fn = vi.fn()
		const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 100))
		act(() => result.current())
		unmount()
		await act(async () => {
			await vi.advanceTimersByTimeAsync(200)
		})
		expect(fn).not.toHaveBeenCalled()
	})
})
// #endregion

// #region RH-10
describe('RH-10 useThrottledCallback', () => {
	beforeEach(() => vi.useFakeTimers())

	it('первый вызов проходит сразу', () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useThrottledCallback(fn, 100))
		act(() => result.current('a'))
		expect(fn).toHaveBeenCalledWith('a')
	})
	it('внутри окна вызовы отбрасываются', () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useThrottledCallback(fn, 100))
		act(() => {
			result.current()
			result.current()
			result.current()
		})
		expect(fn).toHaveBeenCalledTimes(1)
	})
	it('после окна снова проходит', async () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useThrottledCallback(fn, 100))
		act(() => result.current())
		await act(async () => {
			await vi.advanceTimersByTimeAsync(150)
		})
		act(() => result.current())
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
// #endregion

// #region RH-11
describe('RH-11 useInterval', () => {
	beforeEach(() => vi.useFakeTimers())

	it('тикает каждые delay мс', async () => {
		const fn = vi.fn()
		renderHook(() => useInterval(fn, 100))
		await act(async () => {
			await vi.advanceTimersByTimeAsync(350)
		})
		expect(fn).toHaveBeenCalledTimes(3)
	})
	it('delay null ставит на паузу', async () => {
		const fn = vi.fn()
		renderHook(() => useInterval(fn, null))
		await act(async () => {
			await vi.advanceTimersByTimeAsync(500)
		})
		expect(fn).not.toHaveBeenCalled()
	})
	it('смена колбэка не перезапускает интервал', async () => {
		const first = vi.fn()
		const second = vi.fn()
		const { rerender } = renderHook(({ fn }) => useInterval(fn, 100), { initialProps: { fn: first } })
		await act(async () => {
			await vi.advanceTimersByTimeAsync(80)
		})
		rerender({ fn: second })
		await act(async () => {
			await vi.advanceTimersByTimeAsync(20)
		})
		expect(second).toHaveBeenCalledTimes(1)
		expect(first).not.toHaveBeenCalled()
	})
	it('чистит интервал при размонтировании', async () => {
		const fn = vi.fn()
		const { unmount } = renderHook(() => useInterval(fn, 100))
		unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
// #endregion

// #region RH-12
describe('RH-12 useTimeout', () => {
	beforeEach(() => vi.useFakeTimers())

	it('вызывает колбэк один раз', async () => {
		const fn = vi.fn()
		renderHook(() => useTimeout(fn, 100))
		await act(async () => {
			await vi.advanceTimersByTimeAsync(300)
		})
		expect(fn).toHaveBeenCalledTimes(1)
	})
	it('delay null не запускает', async () => {
		const fn = vi.fn()
		renderHook(() => useTimeout(fn, null))
		await act(async () => {
			await vi.advanceTimersByTimeAsync(300)
		})
		expect(fn).not.toHaveBeenCalled()
	})
	it('clear отменяет', async () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useTimeout(fn, 100))
		act(() => result.current.clear())
		await act(async () => {
			await vi.advanceTimersByTimeAsync(300)
		})
		expect(fn).not.toHaveBeenCalled()
	})
	it('restart перезапускает отсчёт', async () => {
		const fn = vi.fn()
		const { result } = renderHook(() => useTimeout(fn, 100))
		await act(async () => {
			await vi.advanceTimersByTimeAsync(80)
		})
		act(() => result.current.restart())
		await act(async () => {
			await vi.advanceTimersByTimeAsync(80)
		})
		expect(fn).not.toHaveBeenCalled()
		await act(async () => {
			await vi.advanceTimersByTimeAsync(40)
		})
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region RH-13
describe('RH-13 useLocalStorage', () => {
	it('без записи в хранилище берёт initial', () => {
		const { result } = renderHook(() => useLocalStorage('k', 'по умолчанию'))
		expect(result.current[0]).toBe('по умолчанию')
	})
	it('читает уже сохранённое', () => {
		window.localStorage.setItem('k', JSON.stringify({ a: 1 }))
		const { result } = renderHook(() => useLocalStorage('k', { a: 0 }))
		expect(result.current[0]).toEqual({ a: 1 })
	})
	it('пишет в хранилище', () => {
		const { result } = renderHook(() => useLocalStorage<number>('n', 0))
		act(() => result.current[1](5))
		expect(result.current[0]).toBe(5)
		expect(window.localStorage.getItem('n')).toBe('5')
	})
	it('поддерживает функциональную форму', () => {
		const { result } = renderHook(() => useLocalStorage<number>('n', 1))
		act(() => result.current[1](prev => prev + 10))
		expect(result.current[0]).toBe(11)
	})
	it('битый JSON не роняет приложение', () => {
		window.localStorage.setItem('broken', '{не json')
		const { result } = renderHook(() => useLocalStorage('broken', 'запасное'))
		expect(result.current[0]).toBe('запасное')
	})
})
// #endregion

// #region RH-14
describe('RH-14 useClickOutside', () => {
	it('срабатывает на клик снаружи', () => {
		const element = document.createElement('div')
		document.body.appendChild(element)
		const handler = vi.fn()
		renderHook(() => useClickOutside({ current: element }, handler))

		fireEvent.mouseDown(document.body)
		expect(handler).toHaveBeenCalledTimes(1)
		element.remove()
	})
	it('не срабатывает на клик внутри', () => {
		const element = document.createElement('div')
		const inner = document.createElement('span')
		element.appendChild(inner)
		document.body.appendChild(element)
		const handler = vi.fn()
		renderHook(() => useClickOutside({ current: element }, handler))

		fireEvent.mouseDown(inner)
		expect(handler).not.toHaveBeenCalled()
		element.remove()
	})
	it('снимает слушатель при размонтировании', () => {
		const element = document.createElement('div')
		document.body.appendChild(element)
		const handler = vi.fn()
		const { unmount } = renderHook(() => useClickOutside({ current: element }, handler))

		unmount()
		fireEvent.mouseDown(document.body)
		expect(handler).not.toHaveBeenCalled()
		element.remove()
	})
})
// #endregion

// #region RH-15
describe('RH-15 useEventListener', () => {
	it('ловит событие на window по умолчанию', () => {
		const handler = vi.fn()
		renderHook(() => useEventListener('resize', handler))
		fireEvent(window, new Event('resize'))
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('работает с произвольной целью', () => {
		const target = document.createElement('div')
		const handler = vi.fn()
		renderHook(() => useEventListener('click', handler, target))
		fireEvent.click(target)
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('отписывается при размонтировании', () => {
		const handler = vi.fn()
		const { unmount } = renderHook(() => useEventListener('resize', handler))
		unmount()
		fireEvent(window, new Event('resize'))
		expect(handler).not.toHaveBeenCalled()
	})
	it('зовёт свежий обработчик без переподписки', () => {
		const first = vi.fn()
		const second = vi.fn()
		const { rerender } = renderHook(({ fn }) => useEventListener('resize', fn), { initialProps: { fn: first } })
		rerender({ fn: second })
		fireEvent(window, new Event('resize'))
		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region RH-16
describe('RH-16 useKeyPress', () => {
	it('реагирует на нужную клавишу', () => {
		const handler = vi.fn()
		renderHook(() => useKeyPress('Escape', handler))
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('игнорирует остальные клавиши', () => {
		const handler = vi.fn()
		renderHook(() => useKeyPress('Escape', handler))
		fireEvent.keyDown(document, { key: 'Enter' })
		expect(handler).not.toHaveBeenCalled()
	})
	it('снимает слушатель', () => {
		const handler = vi.fn()
		const { unmount } = renderHook(() => useKeyPress('Escape', handler))
		unmount()
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(handler).not.toHaveBeenCalled()
	})
})
// #endregion

// #region RH-17
describe('RH-17 useMediaQuery', () => {
	function stubMatchMedia(initial: boolean) {
		const listeners = new Set<(event: { matches: boolean }) => void>()
		const list = {
			matches: initial,
			media: '',
			addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) => listeners.add(cb),
			removeEventListener: (_type: string, cb: (event: { matches: boolean }) => void) => listeners.delete(cb),
		}
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => list)
		)
		return {
			emit(next: boolean) {
				list.matches = next
				listeners.forEach(cb => cb({ matches: next }))
			},
			get listenerCount() {
				return listeners.size
			},
		}
	}

	it('берёт начальное значение из matchMedia', () => {
		stubMatchMedia(true)
		const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
		expect(result.current).toBe(true)
	})
	it('реагирует на изменение', () => {
		const media = stubMatchMedia(false)
		const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
		act(() => media.emit(true))
		expect(result.current).toBe(true)
	})
	it('отписывается при размонтировании', () => {
		const media = stubMatchMedia(false)
		const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
		unmount()
		expect(media.listenerCount).toBe(0)
	})
})
// #endregion

// #region RH-18
describe('RH-18 useOnlineStatus', () => {
	it('реагирует на offline и online', () => {
		const { result } = renderHook(() => useOnlineStatus())
		act(() => {
			window.dispatchEvent(new Event('offline'))
		})
		expect(result.current).toBe(false)
		act(() => {
			window.dispatchEvent(new Event('online'))
		})
		expect(result.current).toBe(true)
	})
	it('отписывается при размонтировании', () => {
		const { result, unmount } = renderHook(() => useOnlineStatus())
		unmount()
		act(() => {
			window.dispatchEvent(new Event('offline'))
		})
		expect(result.current).toBe(true)
	})
})
// #endregion

// #region RH-19
describe('RH-19 useWindowSize', () => {
	const setSize = (width: number, height: number) => {
		Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width })
		Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: height })
	}

	it('берёт текущий размер окна', () => {
		setSize(1024, 768)
		const { result } = renderHook(() => useWindowSize())
		expect(result.current).toEqual({ width: 1024, height: 768 })
	})
	it('обновляется на resize', () => {
		setSize(1024, 768)
		const { result } = renderHook(() => useWindowSize())
		act(() => {
			setSize(375, 812)
			window.dispatchEvent(new Event('resize'))
		})
		expect(result.current).toEqual({ width: 375, height: 812 })
	})
})
// #endregion

// #region RH-20
describe('RH-20 useSelection', () => {
	const items = ['a', 'b', 'c']

	it('изначально пусто', () => {
		const { result } = renderHook(() => useSelection(items))
		expect(result.current.selected).toEqual([])
		expect(result.current.allSelected).toBe(false)
	})
	it('порядок берётся из items, а не из кликов', () => {
		const { result } = renderHook(() => useSelection(items))
		act(() => result.current.toggle('c'))
		act(() => result.current.toggle('a'))
		expect(result.current.selected).toEqual(['a', 'c'])
	})
	it('повторный toggle снимает', () => {
		const { result } = renderHook(() => useSelection(items))
		act(() => result.current.toggle('b'))
		act(() => result.current.toggle('b'))
		expect(result.current.selected).toEqual([])
	})
	it('selectAll и allSelected', () => {
		const { result } = renderHook(() => useSelection(items))
		act(() => result.current.selectAll())
		expect(result.current.selected).toEqual(items)
		expect(result.current.allSelected).toBe(true)
	})
	it('clear сбрасывает', () => {
		const { result } = renderHook(() => useSelection(items))
		act(() => result.current.selectAll())
		act(() => result.current.clear())
		expect(result.current.selected).toEqual([])
	})
	it('isSelected отвечает верно', () => {
		const { result } = renderHook(() => useSelection(items))
		act(() => result.current.toggle('a'))
		expect(result.current.isSelected('a')).toBe(true)
		expect(result.current.isSelected('b')).toBe(false)
	})
})
// #endregion

// #region RH-21
describe('RH-21 useStateWithHistory', () => {
	it('начальное состояние без истории', () => {
		const { result } = renderHook(() => useStateWithHistory('a'))
		expect(result.current.value).toBe('a')
		expect(result.current.canUndo).toBe(false)
		expect(result.current.canRedo).toBe(false)
	})
	it('undo возвращает назад', () => {
		const { result } = renderHook(() => useStateWithHistory('a'))
		act(() => result.current.set('b'))
		act(() => result.current.set('c'))
		act(() => result.current.undo())
		expect(result.current.value).toBe('b')
		expect(result.current.canRedo).toBe(true)
	})
	it('redo возвращает вперёд', () => {
		const { result } = renderHook(() => useStateWithHistory('a'))
		act(() => result.current.set('b'))
		act(() => result.current.undo())
		act(() => result.current.redo())
		expect(result.current.value).toBe('b')
	})
	it('set после undo обрезает будущее', () => {
		const { result } = renderHook(() => useStateWithHistory('a'))
		act(() => result.current.set('b'))
		act(() => result.current.set('c'))
		act(() => result.current.undo())
		act(() => result.current.set('d'))
		expect(result.current.value).toBe('d')
		expect(result.current.canRedo).toBe(false)
	})
	it('undo не уходит за начало', () => {
		const { result } = renderHook(() => useStateWithHistory('a'))
		act(() => result.current.undo())
		expect(result.current.value).toBe('a')
	})
})
// #endregion

// #region RH-22
describe('RH-22 usePagination', () => {
	it('считает страницы', () => {
		const { result } = renderHook(() => usePagination(10, 3))
		expect(result.current.totalPages).toBe(4)
		expect(result.current.page).toBe(1)
		expect(result.current.hasPrev).toBe(false)
	})
	it('срез для первой страницы', () => {
		const { result } = renderHook(() => usePagination(10, 3))
		expect([result.current.from, result.current.to]).toEqual([0, 3])
	})
	it('переход вперёд', () => {
		const { result } = renderHook(() => usePagination(10, 3))
		act(() => result.current.next())
		expect(result.current.page).toBe(2)
		expect([result.current.from, result.current.to]).toEqual([3, 6])
	})
	it('не уходит за последнюю страницу', () => {
		const { result } = renderHook(() => usePagination(10, 3))
		act(() => result.current.go(99))
		expect(result.current.page).toBe(4)
		expect(result.current.hasNext).toBe(false)
		expect([result.current.from, result.current.to]).toEqual([9, 10])
	})
	it('не уходит до первой страницы', () => {
		const { result } = renderHook(() => usePagination(10, 3))
		act(() => result.current.prev())
		expect(result.current.page).toBe(1)
	})
	it('пустой список даёт одну страницу', () => {
		const { result } = renderHook(() => usePagination(0, 10))
		expect(result.current.totalPages).toBe(1)
		expect(result.current.hasNext).toBe(false)
	})
	it('страница зажимается, когда данных стало меньше', () => {
		const { result, rerender } = renderHook(({ total }) => usePagination(total, 3), { initialProps: { total: 10 } })
		act(() => result.current.go(4))
		rerender({ total: 3 })
		expect(result.current.page).toBe(1)
	})
})
// #endregion

// #region RH-23
describe('RH-23 useAsync', () => {
	it('успешный запуск', async () => {
		const { result } = renderHook(() => useAsync(async (n: number) => n * 2))
		await act(async () => {
			await result.current.run(21)
		})
		expect(result.current.data).toBe(42)
		expect(result.current.error).toBeNull()
		expect(result.current.loading).toBe(false)
	})
	it('ошибка попадает в error и не бросается наружу', async () => {
		const { result } = renderHook(() =>
			useAsync(async () => {
				throw new Error('упало')
			})
		)
		await act(async () => {
			await result.current.run()
		})
		expect(result.current.error).toBe('упало')
		expect(result.current.data).toBeNull()
		expect(result.current.loading).toBe(false)
	})
	it('поднимает loading на время работы', async () => {
		let release: (value: string) => void = () => {}
		const promise = new Promise<string>(resolve => {
			release = resolve
		})
		const { result } = renderHook(() => useAsync(() => promise))

		let running: Promise<void>
		act(() => {
			running = result.current.run()
		})
		expect(result.current.loading).toBe(true)

		await act(async () => {
			release('готово')
			await running
		})
		expect(result.current.loading).toBe(false)
		expect(result.current.data).toBe('готово')
	})
})
// #endregion

// #region RH-24
describe('RH-24 useFetchJson', () => {
	const okResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body })

	it('загружает данные', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => okResponse({ id: 1 }))
		)
		const { result } = renderHook(() => useFetchJson<{ id: number }>('/api/1'))
		expect(result.current.loading).toBe(true)
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.data).toEqual({ id: 1 })
		expect(result.current.error).toBeNull()
	})

	it('не-ok превращается в ошибку', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
		)
		const { result } = renderHook(() => useFetchJson('/api/fail'))
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.error).toBe('HTTP 500')
		expect(result.current.data).toBeNull()
	})

	it('при смене url прошлый запрос отменяется', async () => {
		const signals: AbortSignal[] = []
		vi.stubGlobal(
			'fetch',
			vi.fn(async (_url: string, init?: { signal?: AbortSignal }) => {
				if (init?.signal) signals.push(init.signal)
				return okResponse({ id: 1 })
			})
		)
		const { rerender } = renderHook(({ url }) => useFetchJson(url), { initialProps: { url: '/api/1' } })
		rerender({ url: '/api/2' })
		await waitFor(() => expect(signals.length).toBe(2))
		expect(signals[0].aborted).toBe(true)
		expect(signals[1].aborted).toBe(false)
	})

	it('AbortError не показывается как ошибка', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				const error = new Error('Aborted')
				error.name = 'AbortError'
				throw error
			})
		)
		const { result } = renderHook(() => useFetchJson('/api/aborted'))
		await act(async () => {
			await Promise.resolve()
		})
		expect(result.current.error).toBeNull()
	})

	it('reload перезапрашивает', async () => {
		const fetchMock = vi.fn(async () => okResponse({ id: 1 }))
		vi.stubGlobal('fetch', fetchMock)
		const { result } = renderHook(() => useFetchJson('/api/1'))
		await waitFor(() => expect(result.current.loading).toBe(false))
		act(() => result.current.reload())
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
	})
})
// #endregion

// #region RH-25
describe('RH-25 useForm', () => {
	type Values = { email: string; password: string }
	const initial: Values = { email: '', password: '' }
	const validate = (values: Values) => {
		const errors: Partial<Record<keyof Values, string>> = {}
		if (!values.email.includes('@')) errors.email = 'нужен @'
		if (values.password.length < 6) errors.password = 'минимум 6 символов'
		return errors
	}

	it('ошибки считаются из значений', () => {
		const { result } = renderHook(() => useForm(initial, validate))
		expect(result.current.errors.email).toBe('нужен @')
		expect(result.current.isValid).toBe(false)
	})

	it('handleChange меняет нужное поле', () => {
		const { result } = renderHook(() => useForm(initial, validate))
		act(() => result.current.handleChange({ target: { name: 'email', value: 'a@b.ru' } }))
		expect(result.current.values.email).toBe('a@b.ru')
		expect(result.current.values.password).toBe('')
		expect(result.current.errors.email).toBeUndefined()
	})

	it('handleBlur помечает поле тронутым', () => {
		const { result } = renderHook(() => useForm(initial, validate))
		act(() => result.current.handleBlur({ target: { name: 'email' } }))
		expect(result.current.touched.email).toBe(true)
	})

	it('сабмит не проходит с ошибками и помечает всё тронутым', () => {
		const onValid = vi.fn()
		const preventDefault = vi.fn()
		const { result } = renderHook(() => useForm(initial, validate))
		act(() => result.current.handleSubmit(onValid)({ preventDefault }))
		expect(preventDefault).toHaveBeenCalled()
		expect(onValid).not.toHaveBeenCalled()
		expect(result.current.touched.password).toBe(true)
	})

	it('валидная форма сабмитится', () => {
		const onValid = vi.fn()
		const { result } = renderHook(() => useForm(initial, validate))
		act(() => result.current.handleChange({ target: { name: 'email', value: 'a@b.ru' } }))
		act(() => result.current.handleChange({ target: { name: 'password', value: '123456' } }))
		expect(result.current.isValid).toBe(true)
		act(() => result.current.handleSubmit(onValid)({ preventDefault: () => {} }))
		expect(onValid).toHaveBeenCalledWith({ email: 'a@b.ru', password: '123456' })
	})

	it('reset возвращает начальное состояние', () => {
		const { result } = renderHook(() => useForm(initial, validate))
		act(() => result.current.handleChange({ target: { name: 'email', value: 'x' } }))
		act(() => result.current.reset())
		expect(result.current.values).toEqual(initial)
		expect(result.current.touched).toEqual({})
	})
})
// #endregion

// #region RH-26
describe('RH-26 useCopyToClipboard', () => {
	const stubClipboard = (writeText: () => Promise<void>) => {
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
	}

	it('копирует и поднимает флаг', async () => {
		const writeText = vi.fn(async () => {})
		stubClipboard(writeText)
		const { result } = renderHook(() => useCopyToClipboard(1000))
		await act(async () => {
			await result.current[1]('текст')
		})
		expect(writeText).toHaveBeenCalledWith('текст')
		expect(result.current[0]).toBe(true)
	})

	it('флаг сбрасывается через resetMs', async () => {
		vi.useFakeTimers()
		stubClipboard(async () => {})
		const { result } = renderHook(() => useCopyToClipboard(1000))
		await act(async () => {
			await result.current[1]('текст')
		})
		expect(result.current[0]).toBe(true)
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000)
		})
		expect(result.current[0]).toBe(false)
	})

	it('ошибка записи не поднимает флаг', async () => {
		stubClipboard(async () => {
			throw new Error('нет доступа')
		})
		const { result } = renderHook(() => useCopyToClipboard())
		await act(async () => {
			await result.current[1]('текст')
		})
		expect(result.current[0]).toBe(false)
	})
})
// #endregion
