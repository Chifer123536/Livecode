// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sleep } from '../../shared/kit'
import {
	createSafeStorage,
	createTtlStorage,
	deleteCookie,
	delegate,
	el,
	formToObject,
	getCookie,
	getQueryParams,
	isInViewport,
	lockScroll,
	onColorSchemeChange,
	onEvent,
	onOutsideClick,
	parseHashRoute,
	prefersDark,
	rafThrottle,
	renderList,
	setCookie,
	trapFocus,
	updateQuery,
	waitForElement,
} from './tasks'

/** Хранилище в памяти с тем же интерфейсом, что и localStorage. */
const makeStorage = (overrides: Partial<Storage> = {}): Storage => {
	const map = new Map<string, string>()
	return {
		get length() {
			return map.size
		},
		clear: () => map.clear(),
		getItem: (key: string) => map.get(key) ?? null,
		key: (index: number) => [...map.keys()][index] ?? null,
		removeItem: (key: string) => void map.delete(key),
		setItem: (key: string, value: string) => void map.set(key, value),
		...overrides,
	} as Storage
}

const mount = (html: string): HTMLElement => {
	const host = document.createElement('div')
	host.innerHTML = html
	document.body.append(host)
	return host
}

afterEach(() => {
	document.body.innerHTML = ''
	document.body.style.overflow = ''
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

// #region BRW-01
describe('BRW-01 getQueryParams', () => {
	it('разбирает параметры', () => {
		expect(getQueryParams('https://a.ru/x?page=2&q=abc')).toEqual({ page: '2', q: 'abc' })
	})
	it('повторы становятся массивом', () => {
		expect(getQueryParams('https://a.ru/x?tag=a&tag=b')).toEqual({ tag: ['a', 'b'] })
	})
	it('без параметров', () => expect(getQueryParams('https://a.ru/x')).toEqual({}))
	it('значения декодируются', () => expect(getQueryParams('https://a.ru/?q=a%20b')).toEqual({ q: 'a b' }))
})
// #endregion

// #region BRW-02
describe('BRW-02 updateQuery', () => {
	it('меняет и удаляет', () => {
		expect(updateQuery('https://a.ru/x?page=2&q=a', { page: 3, q: null })).toBe('https://a.ru/x?page=3')
	})
	it('добавляет новый параметр', () => {
		expect(updateQuery('https://a.ru/x', { page: 1 })).toBe('https://a.ru/x?page=1')
	})
	it('удаление последнего параметра убирает знак вопроса', () => {
		expect(updateQuery('https://a.ru/x?page=2', { page: null })).toBe('https://a.ru/x')
	})
	it('путь и хэш сохраняются', () => {
		expect(updateQuery('https://a.ru/deep/path?a=1#top', { a: 2 })).toBe('https://a.ru/deep/path?a=2#top')
	})
})
// #endregion

// #region BRW-03
describe('BRW-03 parseHashRoute', () => {
	it('достаёт параметры и query', () => {
		expect(parseHashRoute('#/users/5?tab=info', '/users/:id')).toEqual({
			path: '/users/5',
			params: { id: '5' },
			query: { tab: 'info' },
		})
	})
	it('несколько параметров', () => {
		expect(parseHashRoute('#/a/1/b/2', '/a/:x/b/:y').params).toEqual({ x: '1', y: '2' })
	})
	it('шаблон не подошёл', () => {
		expect(parseHashRoute('#/posts/5', '/users/:id').params).toEqual({})
	})
	it('разное число сегментов', () => {
		expect(parseHashRoute('#/users', '/users/:id').params).toEqual({})
	})
	it('без query', () => expect(parseHashRoute('#/users/5', '/users/:id').query).toEqual({}))
})
// #endregion

// #region BRW-04
describe('BRW-04 createSafeStorage', () => {
	it('пишет и читает объекты', () => {
		const safe = createSafeStorage(makeStorage())
		safe.set('user', { id: 1 })
		expect(safe.get('user', null)).toEqual({ id: 1 })
	})
	it('нет ключа — fallback', () => {
		expect(createSafeStorage(makeStorage()).get('нет', 'по умолчанию')).toBe('по умолчанию')
	})
	it('битый JSON — fallback, а не исключение', () => {
		const storage = makeStorage()
		storage.setItem('broken', '{не json')
		expect(createSafeStorage(storage).get('broken', 'запасное')).toBe('запасное')
	})
	it('переполнение квоты — false, а не падение', () => {
		const storage = makeStorage({
			setItem: () => {
				throw new DOMException('QuotaExceededError')
			},
		})
		expect(createSafeStorage(storage).set('a', 1)).toBe(false)
	})
	it('успешная запись — true', () => expect(createSafeStorage(makeStorage()).set('a', 1)).toBe(true))
	it('remove не падает на недоступном хранилище', () => {
		const storage = makeStorage({
			removeItem: () => {
				throw new Error('нет доступа')
			},
		})
		expect(() => createSafeStorage(storage).remove('a')).not.toThrow()
	})
})
// #endregion

// #region BRW-05
describe('BRW-05 createTtlStorage', () => {
	it('свежее значение читается', () => {
		const ttl = createTtlStorage(makeStorage())
		ttl.set('a', 42, 1000, 0)
		expect(ttl.get('a', 500)).toBe(42)
	})
	it('просроченное возвращает null', () => {
		const ttl = createTtlStorage(makeStorage())
		ttl.set('a', 42, 1000, 0)
		expect(ttl.get('a', 2000)).toBeNull()
	})
	it('просроченное удаляется из хранилища', () => {
		const storage = makeStorage()
		const ttl = createTtlStorage(storage)
		ttl.set('a', 42, 1000, 0)
		ttl.get('a', 2000)
		expect(storage.getItem('a')).toBeNull()
	})
	it('нет ключа — null', () => expect(createTtlStorage(makeStorage()).get('нет', 0)).toBeNull())
	it('объекты тоже хранятся', () => {
		const ttl = createTtlStorage(makeStorage())
		ttl.set('a', { id: 1 }, 1000, 0)
		expect(ttl.get('a', 0)).toEqual({ id: 1 })
	})
})
// #endregion

// #region BRW-06
describe('BRW-06 onEvent', () => {
	it('подписывает', () => {
		const button = document.createElement('button')
		const handler = vi.fn()
		onEvent(button, 'click', handler)
		button.click()
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('возвращённая функция отписывает', () => {
		const button = document.createElement('button')
		const handler = vi.fn()
		const off = onEvent(button, 'click', handler)
		off()
		button.click()
		expect(handler).not.toHaveBeenCalled()
	})
})
// #endregion

// #region BRW-07
describe('BRW-07 delegate', () => {
	it('ловит клик по потомку', () => {
		const host = mount('<ul><li><button class="del">x</button></li></ul>')
		const handler = vi.fn()
		delegate(host, '.del', 'click', handler)

		host.querySelector<HTMLElement>('.del')?.click()
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('передаёт найденный элемент', () => {
		const host = mount('<button class="del" data-id="7">x</button>')
		const handler = vi.fn()
		delegate(host, '.del', 'click', handler)

		host.querySelector<HTMLElement>('.del')?.click()
		expect(handler.mock.calls[0][1].dataset.id).toBe('7')
	})
	it('работает для элементов, добавленных позже', () => {
		const host = mount('<div></div>')
		const handler = vi.fn()
		delegate(host, '.del', 'click', handler)

		const late = document.createElement('button')
		late.className = 'del'
		host.append(late)
		late.click()

		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('игнорирует неподходящие цели', () => {
		const host = mount('<button class="other">x</button>')
		const handler = vi.fn()
		delegate(host, '.del', 'click', handler)

		host.querySelector<HTMLElement>('.other')?.click()
		expect(handler).not.toHaveBeenCalled()
	})
	it('отписка работает', () => {
		const host = mount('<button class="del">x</button>')
		const handler = vi.fn()
		const off = delegate(host, '.del', 'click', handler)
		off()

		host.querySelector<HTMLElement>('.del')?.click()
		expect(handler).not.toHaveBeenCalled()
	})
})
// #endregion

// #region BRW-08
describe('BRW-08 onOutsideClick', () => {
	it('срабатывает на клик мимо', () => {
		const host = mount('<div id="menu"></div>')
		const menu = host.querySelector<HTMLElement>('#menu') as HTMLElement
		const handler = vi.fn()
		onOutsideClick(menu, handler)

		document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('клик внутри не считается', () => {
		const host = mount('<div id="menu"><button>в меню</button></div>')
		const menu = host.querySelector<HTMLElement>('#menu') as HTMLElement
		const handler = vi.fn()
		onOutsideClick(menu, handler)

		menu.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handler).not.toHaveBeenCalled()
	})
	it('отписка снимает обработчик', () => {
		const host = mount('<div id="menu"></div>')
		const menu = host.querySelector<HTMLElement>('#menu') as HTMLElement
		const handler = vi.fn()
		onOutsideClick(menu, handler)()

		document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handler).not.toHaveBeenCalled()
	})
})
// #endregion

// #region BRW-09
describe('BRW-09 isInViewport', () => {
	const withRect = (rect: Partial<DOMRect>): HTMLElement => {
		const node = document.createElement('div')
		vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			toJSON: () => ({}),
			...rect,
		} as DOMRect)
		return node
	}

	it('элемент в окне', () => {
		expect(isInViewport(withRect({ top: 10, bottom: 50, left: 10, right: 50 }))).toBe(true)
	})
	it('элемент выше окна', () => {
		expect(isInViewport(withRect({ top: -100, bottom: -10, left: 0, right: 50 }))).toBe(false)
	})
	it('элемент ниже окна', () => {
		const below = window.innerHeight + 10
		expect(isInViewport(withRect({ top: below, bottom: below + 50, left: 0, right: 50 }))).toBe(false)
	})
	it('виден частично', () => {
		expect(isInViewport(withRect({ top: -10, bottom: 20, left: 0, right: 50 }))).toBe(true)
	})
})
// #endregion

// #region BRW-10
describe('BRW-10 lockScroll', () => {
	it('блокирует прокрутку', () => {
		lockScroll()
		expect(document.body.style.overflow).toBe('hidden')
	})
	it('возвращает прежнее значение', () => {
		document.body.style.overflow = 'auto'
		const unlock = lockScroll()
		unlock()
		expect(document.body.style.overflow).toBe('auto')
	})
	it('пустое значение тоже восстанавливается', () => {
		const unlock = lockScroll()
		unlock()
		expect(document.body.style.overflow).toBe('')
	})
})
// #endregion

// #region BRW-11
describe('BRW-11 el', () => {
	it('создаёт элемент с классом и текстом', () => {
		const node = el('p', { className: 'text', textContent: 'привет' })
		expect(node.tagName).toBe('P')
		expect(node.className).toBe('text')
		expect(node.textContent).toBe('привет')
	})
	it('вешает обработчик', () => {
		const handler = vi.fn()
		const node = el('button', { onClick: handler })
		node.click()
		expect(handler).toHaveBeenCalledTimes(1)
	})
	it('остальное уходит в атрибуты', () => {
		const node = el('div', { 'data-id': 5, 'aria-label': 'метка' })
		expect(node.getAttribute('data-id')).toBe('5')
		expect(node.getAttribute('aria-label')).toBe('метка')
	})
	it('дети строками и узлами', () => {
		const node = el('div', {}, ['текст ', el('b', { textContent: 'жирный' })])
		expect(node.textContent).toBe('текст жирный')
		expect(node.querySelector('b')).not.toBeNull()
	})
	it('без props и children', () => expect(el('span').tagName).toBe('SPAN'))
})
// #endregion

// #region BRW-12
describe('BRW-12 renderList', () => {
	it('рисует пункты', () => {
		const ul = document.createElement('ul')
		renderList(ul, ['а', 'б'])
		expect(ul.querySelectorAll('li')).toHaveLength(2)
		expect(ul.textContent).toBe('аб')
	})
	it('перерисовка заменяет старое', () => {
		const ul = document.createElement('ul')
		renderList(ul, ['а', 'б'])
		renderList(ul, ['в'])
		expect(ul.querySelectorAll('li')).toHaveLength(1)
	})
	it('пустой список очищает контейнер', () => {
		const ul = document.createElement('ul')
		renderList(ul, ['а'])
		renderList(ul, [])
		expect(ul.children).toHaveLength(0)
	})
	it('разметка в данных не исполняется', () => {
		const ul = document.createElement('ul')
		renderList(ul, ['<img src=x onerror=alert(1)>'])
		expect(ul.querySelector('img')).toBeNull()
		expect(ul.textContent).toBe('<img src=x onerror=alert(1)>')
	})
})
// #endregion

// #region BRW-13
describe('BRW-13 formToObject', () => {
	const form = (html: string): HTMLFormElement => {
		const host = mount(`<form>${html}</form>`)
		return host.querySelector('form') as HTMLFormElement
	}

	it('собирает значения', () => {
		expect(formToObject(form('<input name="a" value="1"><input name="b" value="2">'))).toEqual({
			a: '1',
			b: '2',
		})
	})
	it('повторяющиеся имена — массив', () => {
		const node = form('<input type="checkbox" name="t" value="x" checked><input type="checkbox" name="t" value="y" checked>')
		expect(formToObject(node)).toEqual({ t: ['x', 'y'] })
	})
	it('поля без name пропускаются', () => {
		expect(formToObject(form('<input value="без имени"><input name="a" value="1">'))).toEqual({ a: '1' })
	})
	it('пустая форма', () => expect(formToObject(form(''))).toEqual({}))
})
// #endregion

// #region BRW-14
describe('BRW-14 куки', () => {
	it('записывает и читает', () => {
		setCookie('token', 'abc')
		expect(getCookie('token')).toBe('abc')
	})
	it('кодирует значение', () => {
		setCookie('name', 'Ян Иванов')
		expect(getCookie('name')).toBe('Ян Иванов')
	})
	it('нет куки — null', () => expect(getCookie('нет-такой')).toBeNull())
	it('удаление', () => {
		setCookie('temp', '1')
		deleteCookie('temp')
		expect(getCookie('temp')).toBeNull()
	})
	it('не путает похожие имена', () => {
		setCookie('a', '1')
		setCookie('ab', '2')
		expect(getCookie('a')).toBe('1')
		expect(getCookie('ab')).toBe('2')
	})
})
// #endregion

// #region BRW-15
describe('BRW-15 тёмная тема', () => {
	/** Подменяем matchMedia: настоящая тема в тестах недоступна и зависит от системы. */
	const stubMatchMedia = (matches: boolean) => {
		const listeners = new Set<(event: MediaQueryListEvent) => void>()
		const query = {
			matches,
			media: '(prefers-color-scheme: dark)',
			addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => void listeners.add(listener),
			removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
				void listeners.delete(listener),
		}
		vi.stubGlobal('matchMedia', () => query)
		return {
			emit: (dark: boolean) => listeners.forEach(listener => listener({ matches: dark } as MediaQueryListEvent)),
			count: () => listeners.size,
		}
	}

	it('тёмная тема включена', () => {
		stubMatchMedia(true)
		expect(prefersDark()).toBe(true)
	})
	it('светлая тема', () => {
		stubMatchMedia(false)
		expect(prefersDark()).toBe(false)
	})
	it('подписка получает смену темы', () => {
		const media = stubMatchMedia(false)
		const handler = vi.fn()
		onColorSchemeChange(handler)

		media.emit(true)
		expect(handler).toHaveBeenCalledWith(true)
	})
	it('отписка снимает слушателя', () => {
		const media = stubMatchMedia(false)
		onColorSchemeChange(vi.fn())()
		expect(media.count()).toBe(0)
	})
})
// #endregion

// #region BRW-16
describe('BRW-16 trapFocus', () => {
	const setup = () => {
		const host = mount('<div id="modal"><button id="first">1</button><button id="mid">2</button><button id="last">3</button></div>')
		return host.querySelector<HTMLElement>('#modal') as HTMLElement
	}
	const tab = (element: HTMLElement, shiftKey = false) =>
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }))

	it('с последнего уводит на первый', () => {
		const modal = setup()
		trapFocus(modal)

		const last = modal.querySelector<HTMLElement>('#last') as HTMLElement
		last.focus()
		tab(last)

		expect(document.activeElement?.id).toBe('first')
	})
	it('Shift+Tab с первого уводит на последний', () => {
		const modal = setup()
		trapFocus(modal)

		const first = modal.querySelector<HTMLElement>('#first') as HTMLElement
		first.focus()
		tab(first, true)

		expect(document.activeElement?.id).toBe('last')
	})
	it('в середине фокус не перехватывается', () => {
		const modal = setup()
		trapFocus(modal)

		const mid = modal.querySelector<HTMLElement>('#mid') as HTMLElement
		mid.focus()
		tab(mid)

		expect(document.activeElement?.id).toBe('mid')
	})
	it('другие клавиши игнорируются', () => {
		const modal = setup()
		trapFocus(modal)

		const last = modal.querySelector<HTMLElement>('#last') as HTMLElement
		last.focus()
		last.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))

		expect(document.activeElement?.id).toBe('last')
	})
	it('снятие ловушки', () => {
		const modal = setup()
		trapFocus(modal)()

		const last = modal.querySelector<HTMLElement>('#last') as HTMLElement
		last.focus()
		tab(last)

		expect(document.activeElement?.id).toBe('last')
	})
})
// #endregion

// #region BRW-17
describe('BRW-17 waitForElement', () => {
	it('элемент уже есть', async () => {
		mount('<div class="ready"></div>')
		expect(await waitForElement('.ready', 100)).not.toBeNull()
	})
	it('элемент появляется позже', async () => {
		const promise = waitForElement('.later', 500)
		setTimeout(() => mount('<div class="later"></div>'), 20)
		expect(await promise).not.toBeNull()
	})
	it('таймаут возвращает null', async () => {
		expect(await waitForElement('.никогда', 30)).toBeNull()
	})
	it('после находки наблюдение прекращается', async () => {
		const spy = vi.spyOn(MutationObserver.prototype, 'disconnect')
		const promise = waitForElement('.stop', 500)
		setTimeout(() => mount('<div class="stop"></div>'), 10)
		await promise
		expect(spy).toHaveBeenCalled()
	})
})
// #endregion

// #region BRW-18
describe('BRW-18 rafThrottle', () => {
	it('несколько вызовов схлопываются в один', async () => {
		const fn = vi.fn()
		const throttled = rafThrottle(fn)

		throttled()
		throttled()
		throttled()
		await sleep(50)

		expect(fn).toHaveBeenCalledTimes(1)
	})
	it('выполняются последние аргументы', async () => {
		const fn = vi.fn()
		const throttled = rafThrottle(fn)

		throttled(1)
		throttled(2)
		throttled(3)
		await sleep(50)

		expect(fn).toHaveBeenCalledWith(3)
	})
	it('следующий кадр — новый вызов', async () => {
		const fn = vi.fn()
		const throttled = rafThrottle(fn)

		throttled()
		await sleep(50)
		throttled()
		await sleep(50)

		expect(fn).toHaveBeenCalledTimes(2)
	})
	it('cancel отменяет запланированный кадр', async () => {
		const fn = vi.fn()
		const throttled = rafThrottle(fn)

		throttled()
		throttled.cancel()
		await sleep(50)

		expect(fn).not.toHaveBeenCalled()
	})
})
// #endregion
