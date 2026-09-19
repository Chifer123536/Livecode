// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
	ActionParent,
	Child,
	ClickTracker,
	ConfigParent,
	DoubleUpdate,
	Expensive,
	ExpensiveSum,
	FilteredList,
	LazyInit,
	NotePanel,
	Parent,
	RowList,
	StoreValue,
	TransitionTabs,
	UserCard,
	UserEditor,
	WindowedList,
	Wrapper,
} from './tasks'

afterEach(cleanup)

const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const typeInto = (label: string, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } })

// #region RP-01
describe('RP-01 мемоизация дочернего компонента', () => {
	it('клик перерисовывает только родителя', () => {
		const parentRender = vi.fn()
		const childRender = vi.fn()
		render(<Parent parentRender={parentRender} childRender={childRender} />)

		expect(parentRender).toHaveBeenCalledTimes(1)
		expect(childRender).toHaveBeenCalledTimes(1)

		click('+1')
		click('+1')

		expect(parentRender).toHaveBeenCalledTimes(3)
		expect(childRender).toHaveBeenCalledTimes(1)
	})

	it('ребёнок выводит свой title', () => {
		render(<Child title="заголовок" onRender={() => {}} />)
		expect(screen.getByText('заголовок')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-02
describe('RP-02 стабильный обработчик', () => {
	it('колбэк не ломает мемоизацию', () => {
		const parentRender = vi.fn()
		const childRender = vi.fn()
		render(<ActionParent parentRender={parentRender} childRender={childRender} />)

		click('+1')
		click('+1')

		expect(parentRender).toHaveBeenCalledTimes(3)
		expect(childRender).toHaveBeenCalledTimes(1)
	})

	it('кнопка ребёнка работает', () => {
		render(<ActionParent parentRender={() => {}} childRender={() => {}} />)
		click('Действие')
		expect(screen.getByText('Счёт: 1')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-03
describe('RP-03 стабильный объект в пропсах', () => {
	it('объект не пересоздаётся', () => {
		const childRender = vi.fn()
		render(<ConfigParent parentRender={() => {}} childRender={childRender} />)

		click('+1')
		click('+1')

		expect(childRender).toHaveBeenCalledTimes(1)
		expect(screen.getByText('Тема: dark')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-04
describe('RP-04 дорогое вычисление', () => {
	it('ввод текста не пересчитывает сумму', () => {
		const calculate = vi.fn()
		const numbers = [1, 2, 3]
		render(<ExpensiveSum numbers={numbers} calculate={calculate} />)

		expect(screen.getByText('Сумма: 6')).toBeInTheDocument()
		expect(calculate).toHaveBeenCalledTimes(1)

		typeInto('Текст', 'а')
		typeInto('Текст', 'аб')

		expect(calculate).toHaveBeenCalledTimes(1)
	})

	it('смена массива пересчитывает', () => {
		const calculate = vi.fn()
		const view = render(<ExpensiveSum numbers={[1]} calculate={calculate} />)
		view.rerender(<ExpensiveSum numbers={[1, 2]} calculate={calculate} />)
		expect(calculate).toHaveBeenCalledTimes(2)
		expect(screen.getByText('Сумма: 3')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-05
describe('RP-05 свой компаратор в memo', () => {
	it('новый объект с тем же id не перерисовывает', () => {
		const onRender = vi.fn()
		const view = render(<UserCard user={{ id: 1, name: 'Аня' }} onRender={onRender} />)
		view.rerender(<UserCard user={{ id: 1, name: 'Аня' }} onRender={onRender} />)
		expect(onRender).toHaveBeenCalledTimes(1)
	})

	it('смена id перерисовывает', () => {
		const onRender = vi.fn()
		const view = render(<UserCard user={{ id: 1, name: 'Аня' }} onRender={onRender} />)
		view.rerender(<UserCard user={{ id: 2, name: 'Боря' }} onRender={onRender} />)
		expect(onRender).toHaveBeenCalledTimes(2)
		expect(screen.getByText('Пользователь: Боря')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-06
describe('RP-06 ленивая инициализация состояния', () => {
	it('init вызывается один раз', () => {
		const init = vi.fn(() => 10)
		render(<LazyInit init={init} />)

		expect(screen.getByText('Значение: 10')).toBeInTheDocument()
		click('+1')
		click('+1')

		expect(init).toHaveBeenCalledTimes(1)
		expect(screen.getByText('Значение: 12')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-07
describe('RP-07 ref вместо состояния', () => {
	it('клики не вызывают перерисовку', () => {
		const onRender = vi.fn()
		render(<ClickTracker onRender={onRender} />)

		click('Клик')
		click('Клик')
		click('Клик')

		expect(onRender).toHaveBeenCalledTimes(1)
		expect(screen.queryByText(/Кликов/)).not.toBeInTheDocument()
	})

	it('показывает накопленное значение', () => {
		render(<ClickTracker onRender={() => {}} />)
		click('Клик')
		click('Клик')
		click('Показать')
		expect(screen.getByText('Кликов: 2')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-08
describe('RP-08 children как пропс', () => {
	it('содержимое не перерисовывается вместе с обёрткой', () => {
		const wrapperRender = vi.fn()
		const expensiveRender = vi.fn()

		render(
			<Wrapper onRender={wrapperRender}>
				<Expensive onRender={expensiveRender} />
			</Wrapper>
		)

		click('+1')
		click('+1')

		expect(wrapperRender).toHaveBeenCalledTimes(3)
		expect(expensiveRender).toHaveBeenCalledTimes(1)
		expect(screen.getByText('Дорогой контент')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-09
describe('RP-09 вынести состояние вниз', () => {
	it('ввод в поле не трогает список', () => {
		const listRender = vi.fn()
		render(<NotePanel items={['раз', 'два']} listRender={listRender} />)

		typeInto('Заметка', 'а')
		typeInto('Заметка', 'аб')

		expect(listRender).toHaveBeenCalledTimes(1)
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
	})
})
// #endregion

// #region RP-10
describe('RP-10 мемоизированный элемент списка', () => {
	const initial = [
		{ id: 'a', title: 'Первая' },
		{ id: 'b', title: 'Вторая' },
		{ id: 'c', title: 'Третья' },
	]

	it('удаление одного не перерисовывает остальные', () => {
		const rowRender = vi.fn()
		render(<RowList initial={initial} rowRender={rowRender} />)

		expect(rowRender).toHaveBeenCalledTimes(3)
		rowRender.mockClear()

		click('Удалить Первая')

		expect(screen.queryByText('Первая')).not.toBeInTheDocument()
		expect(rowRender).not.toHaveBeenCalled()
	})

	it('строка действительно удаляется', () => {
		render(<RowList initial={initial} rowRender={() => {}} />)
		click('Удалить Вторая')
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
	})
})
// #endregion

// #region RP-11
describe('RP-11 подписка на внешний стор', () => {
	function makeStore(initial: number) {
		let value = initial
		const listeners = new Set<() => void>()
		return {
			subscribe: (listener: () => void) => {
				listeners.add(listener)
				return () => {
					listeners.delete(listener)
				}
			},
			getSnapshot: () => value,
			set(next: number) {
				value = next
				listeners.forEach(listener => listener())
			},
			get listenerCount() {
				return listeners.size
			},
		}
	}

	it('читает значение из стора', () => {
		const store = makeStore(5)
		render(<StoreValue store={store} onRender={() => {}} />)
		expect(screen.getByText('Значение: 5')).toBeInTheDocument()
	})

	it('реагирует на изменение', () => {
		const store = makeStore(1)
		render(<StoreValue store={store} onRender={() => {}} />)
		act(() => store.set(2))
		expect(screen.getByText('Значение: 2')).toBeInTheDocument()
	})

	it('отписывается при размонтировании', () => {
		const store = makeStore(1)
		const view = render(<StoreValue store={store} onRender={() => {}} />)
		expect(store.listenerCount).toBe(1)
		view.unmount()
		expect(store.listenerCount).toBe(0)
	})
})
// #endregion

// #region RP-12
describe('RP-12 переход без блокировки', () => {
	it('переключает вкладки', async () => {
		render(<TransitionTabs />)
		expect(screen.getByText('Быстрое содержимое')).toBeInTheDocument()

		await act(async () => {
			fireEvent.click(screen.getByRole('tab', { name: 'Тяжёлая' }))
		})

		expect(screen.getByText('Тяжёлое содержимое')).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: 'Тяжёлая' })).toHaveAttribute('aria-selected', 'true')
	})

	it('активна ровно одна вкладка', () => {
		render(<TransitionTabs />)
		const selected = screen.getAllByRole('tab').filter(tab => tab.getAttribute('aria-selected') === 'true')
		expect(selected).toHaveLength(1)
	})
})
// #endregion

// #region RP-13
describe('RP-13 окно списка', () => {
	const items = Array.from({ length: 10 }, (_, i) => `элемент ${i}`)

	it('рендерит только окно', () => {
		render(<WindowedList items={items} visible={3} />)
		expect(screen.getAllByRole('listitem')).toHaveLength(3)
		expect(screen.getByText('Показано 3 из 10')).toBeInTheDocument()
		expect(screen.queryByText('элемент 5')).not.toBeInTheDocument()
	})

	it('двигает окно вниз и вверх', () => {
		render(<WindowedList items={items} visible={3} />)
		click('Вниз')
		expect(screen.getByText('элемент 3')).toBeInTheDocument()
		click('Вверх')
		expect(screen.getByText('элемент 0')).toBeInTheDocument()
	})

	it('не уходит за границы', () => {
		render(<WindowedList items={items} visible={3} />)
		for (let i = 0; i < 10; i++) click('Вниз')
		expect(screen.getAllByRole('listitem')).toHaveLength(3)
		expect(screen.getByText('элемент 9')).toBeInTheDocument()

		for (let i = 0; i < 10; i++) click('Вверх')
		expect(screen.getByText('элемент 0')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-14
describe('RP-14 батчинг обновлений', () => {
	it('два setState дают один рендер', () => {
		const onRender = vi.fn()
		render(<DoubleUpdate onRender={onRender} />)
		onRender.mockClear()

		click('Обновить оба')

		expect(onRender).toHaveBeenCalledTimes(1)
		expect(screen.getByText('A: 1, B: 1')).toBeInTheDocument()
	})

	it('в промисе тоже батчится', async () => {
		const onRender = vi.fn()
		render(<DoubleUpdate onRender={onRender} />)
		onRender.mockClear()

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: 'Обновить в промисе' }))
		})

		expect(onRender).toHaveBeenCalledTimes(1)
		expect(screen.getByText('A: 1, B: 1')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-15
describe('RP-15 производное состояние без эффекта', () => {
	it('фильтрует и даёт результат за один рендер', () => {
		const onRender = vi.fn()
		render(<FilteredList items={['яблоко', 'груша', 'ананас']} onRender={onRender} />)
		onRender.mockClear()

		typeInto('Фильтр', 'ан')

		expect(onRender).toHaveBeenCalledTimes(1)
		expect(screen.getByText('Найдено: 1')).toBeInTheDocument()
		expect(screen.getByText('ананас')).toBeInTheDocument()
	})

	it('пустой фильтр показывает всё', () => {
		render(<FilteredList items={['а', 'б']} onRender={() => {}} />)
		expect(screen.getByText('Найдено: 2')).toBeInTheDocument()
	})
})
// #endregion

// #region RP-16
describe('RP-16 сброс состояния через key', () => {
	const users = [
		{ id: 1, name: 'Аня' },
		{ id: 2, name: 'Боря' },
	]

	it('поле сбрасывается при смене пользователя', () => {
		render(<UserEditor users={users} />)
		const input = () => screen.getByLabelText('Имя') as HTMLInputElement

		expect(input().value).toBe('Аня')
		fireEvent.change(input(), { target: { value: 'что-то своё' } })
		expect(input().value).toBe('что-то своё')

		click('Следующий')
		expect(input().value).toBe('Боря')
	})

	it('возврат к первому пользователю тоже сбрасывает', () => {
		render(<UserEditor users={users} />)
		const input = () => screen.getByLabelText('Имя') as HTMLInputElement

		fireEvent.change(input(), { target: { value: 'мусор' } })
		click('Следующий')
		click('Следующий')
		expect(input().value).toBe('Аня')
	})
})
// #endregion
