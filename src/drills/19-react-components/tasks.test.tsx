// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	Autocomplete,
	CopyButton,
	Countdown,
	FilterPanel,
	Modal,
	MultiStepForm,
	Pagination,
	PasswordStrength,
	QuantityInput,
	SearchWithDebounce,
	ShoppingCart,
	SignupForm,
	SortableTable,
	StarRating,
	ThemeButton,
	ThemeProvider,
	Toasts,
	TodoList,
	UserSearch,
	useTheme,
} from './tasks'

afterEach(() => {
	cleanup()
	vi.useRealTimers()
	vi.unstubAllGlobals()
	document.body.style.overflow = ''
})

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

// #region RC-01
describe('RC-01 TodoList', () => {
	const add = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
		await user.type(screen.getByLabelText('Новая задача'), text)
		await user.click(screen.getByRole('button', { name: 'Добавить' }))
	}

	it('пустой список', () => {
		render(<TodoList />)
		expect(screen.getByText('Задач нет')).toBeInTheDocument()
		expect(screen.getByText('Осталось: 0')).toBeInTheDocument()
	})

	it('добавляет и чистит поле', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, 'купить хлеб')
		expect(screen.getByLabelText('купить хлеб')).toBeInTheDocument()
		expect((screen.getByLabelText('Новая задача') as HTMLInputElement).value).toBe('')
		expect(screen.getByText('Осталось: 1')).toBeInTheDocument()
	})

	it('не добавляет пробелы', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, '   ')
		expect(screen.getByText('Задач нет')).toBeInTheDocument()
	})

	it('отмечает выполненной и меняет счётчик', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, 'задача')
		await user.click(screen.getByLabelText('задача'))
		expect(screen.getByLabelText('задача')).toBeChecked()
		expect(screen.getByText('Осталось: 0')).toBeInTheDocument()
	})

	it('удаляет нужную задачу', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, 'первая')
		await add(user, 'вторая')
		await user.click(screen.getByRole('button', { name: 'Удалить первая' }))
		expect(screen.queryByLabelText('первая')).not.toBeInTheDocument()
		expect(screen.getByLabelText('вторая')).toBeInTheDocument()
	})

	it('фильтрует активные и выполненные', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, 'раз')
		await add(user, 'два')
		await user.click(screen.getByLabelText('раз'))

		await user.click(screen.getByRole('button', { name: 'Активные' }))
		expect(screen.queryByLabelText('раз')).not.toBeInTheDocument()
		expect(screen.getByLabelText('два')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Активные' })).toHaveAttribute('aria-pressed', 'true')

		await user.click(screen.getByRole('button', { name: 'Выполненные' }))
		expect(screen.getByLabelText('раз')).toBeInTheDocument()
		expect(screen.queryByLabelText('два')).not.toBeInTheDocument()
	})

	it('очищает выполненные', async () => {
		const user = userEvent.setup()
		render(<TodoList />)
		await add(user, 'раз')
		await add(user, 'два')
		await user.click(screen.getByLabelText('раз'))
		await user.click(screen.getByRole('button', { name: 'Очистить выполненные' }))
		expect(screen.queryByLabelText('раз')).not.toBeInTheDocument()
		expect(screen.getByLabelText('два')).toBeInTheDocument()
	})
})
// #endregion

// #region RC-02
describe('RC-02 SearchWithDebounce', () => {
	const items = ['яблоко', 'ананас', 'груша']
	beforeEach(() => vi.useFakeTimers())

	it('без запроса показывает всё', () => {
		render(<SearchWithDebounce items={items} />)
		expect(screen.getByText('Найдено: 3')).toBeInTheDocument()
	})

	it('фильтрует только после паузы', async () => {
		render(<SearchWithDebounce items={items} delay={300} />)
		type('Поиск', 'ан')
		expect(screen.getByText('Печатает…')).toBeInTheDocument()
		expect(screen.getByText('Найдено: 3')).toBeInTheDocument()

		await act(async () => {
			await vi.advanceTimersByTimeAsync(300)
		})
		expect(screen.getByText('Найдено: 1')).toBeInTheDocument()
		expect(screen.getByText('ананас')).toBeInTheDocument()
		expect(screen.queryByText('Печатает…')).not.toBeInTheDocument()
	})

	it('регистр не важен', async () => {
		render(<SearchWithDebounce items={items} delay={100} />)
		type('Поиск', 'ЯБЛ')
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100)
		})
		expect(screen.getByText('Найдено: 1')).toBeInTheDocument()
	})

	it('пустой результат', async () => {
		render(<SearchWithDebounce items={items} delay={100} />)
		type('Поиск', 'zzz')
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100)
		})
		expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
	})
})
// #endregion

// #region RC-03
describe('RC-03 UserSearch', () => {
	it('пустой запрос ничего не грузит', () => {
		const search = vi.fn()
		render(<UserSearch search={search} />)
		expect(screen.getByText('Введите запрос')).toBeInTheDocument()
		expect(search).not.toHaveBeenCalled()
	})

	it('показывает загрузку и результат', async () => {
		const search = vi.fn(async () => ['Анна', 'Андрей'])
		render(<UserSearch search={search} />)
		type('Пользователь', 'ан')
		expect(screen.getByText('Загрузка…')).toBeInTheDocument()
		await waitFor(() => expect(screen.getByText('Анна')).toBeInTheDocument())
		expect(screen.queryByText('Загрузка…')).not.toBeInTheDocument()
	})

	it('пустой ответ', async () => {
		const search = vi.fn(async () => [])
		render(<UserSearch search={search} />)
		type('Пользователь', 'ъъ')
		await waitFor(() => expect(screen.getByText('Никого не нашли')).toBeInTheDocument())
	})

	it('ошибка и повтор', async () => {
		const search = vi
			.fn<(query: string, signal: AbortSignal) => Promise<string[]>>()
			.mockRejectedValueOnce(new Error('Сервер недоступен'))
			.mockResolvedValueOnce(['Борис'])
		render(<UserSearch search={search} />)
		type('Пользователь', 'бо')
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Сервер недоступен'))

		fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(screen.getByText('Борис')).toBeInTheDocument())
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})

	it('отменяет прошлый запрос при смене ввода', async () => {
		const signals: AbortSignal[] = []
		const search = vi.fn(async (_query: string, signal: AbortSignal) => {
			signals.push(signal)
			return ['ок']
		})
		render(<UserSearch search={search} />)
		type('Пользователь', 'а')
		type('Пользователь', 'аб')
		await waitFor(() => expect(signals.length).toBe(2))
		expect(signals[0].aborted).toBe(true)
		expect(signals[1].aborted).toBe(false)
	})

	it('AbortError не показывается как ошибка', async () => {
		const search = vi.fn(async () => {
			const error = new Error('Aborted')
			error.name = 'AbortError'
			throw error
		})
		render(<UserSearch search={search} />)
		type('Пользователь', 'а')
		await act(async () => {
			await Promise.resolve()
		})
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})
})
// #endregion

// #region RC-04
describe('RC-04 SignupForm', () => {
	const fill = () => {
		type('Email', 'a@b.ru')
		type('Пароль', '123456')
		type('Повтор пароля', '123456')
	}

	it('кнопка задизейблена на пустой форме', () => {
		render(<SignupForm onSubmit={vi.fn()} />)
		expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeDisabled()
	})

	it('ошибка появляется только после blur', () => {
		render(<SignupForm onSubmit={vi.fn()} />)
		type('Email', 'кривой')
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		fireEvent.blur(screen.getByLabelText('Email'))
		expect(screen.getByRole('alert')).toHaveTextContent('Нужен корректный email')
		expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
	})

	it('ловит несовпадение паролей', () => {
		render(<SignupForm onSubmit={vi.fn()} />)
		type('Пароль', '123456')
		type('Повтор пароля', '654321')
		fireEvent.blur(screen.getByLabelText('Повтор пароля'))
		expect(screen.getByRole('alert')).toHaveTextContent('Пароли не совпадают')
	})

	it('смена пароля пересчитывает ошибку повтора', () => {
		render(<SignupForm onSubmit={vi.fn()} />)
		type('Пароль', '123456')
		type('Повтор пароля', '123456')
		fireEvent.blur(screen.getByLabelText('Повтор пароля'))
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		type('Пароль', '1234567')
		expect(screen.getByRole('alert')).toHaveTextContent('Пароли не совпадают')
	})

	it('валидная форма отправляется и очищается', () => {
		const onSubmit = vi.fn()
		render(<SignupForm onSubmit={onSubmit} />)
		fill()
		const button = screen.getByRole('button', { name: 'Зарегистрироваться' })
		expect(button).toBeEnabled()
		fireEvent.click(button)
		expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.ru', password: '123456', confirm: '123456' })
		expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('')
	})
})
// #endregion

// #region RC-05
describe('RC-05 Modal', () => {
	it('закрытая модалка ничего не рендерит', () => {
		render(
			<Modal open={false} onClose={vi.fn()} title="Заголовок">
				<p>Контент</p>
			</Modal>
		)
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('рендерится в body с нужными атрибутами', () => {
		render(
			<Modal open onClose={vi.fn()} title="Заголовок">
				<p>Контент</p>
			</Modal>
		)
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(within(dialog).getByRole('heading', { name: 'Заголовок' })).toBeInTheDocument()
		expect(dialog.closest('body')).toBe(document.body)
	})

	it('закрывается по Escape', () => {
		const onClose = vi.fn()
		render(<Modal open onClose={onClose} title="Заголовок" />)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('закрывается по клику на оверлей, но не по контенту', () => {
		const onClose = vi.fn()
		render(
			<Modal open onClose={onClose} title="Заголовок">
				<p>Контент</p>
			</Modal>
		)
		fireEvent.click(screen.getByText('Контент'))
		expect(onClose).not.toHaveBeenCalled()
		fireEvent.click(screen.getByTestId('overlay'))
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('кнопка закрытия работает', () => {
		const onClose = vi.fn()
		render(<Modal open onClose={onClose} title="Заголовок" />)
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('блокирует и возвращает скролл body', () => {
		const view = render(<Modal open onClose={vi.fn()} title="Заголовок" />)
		expect(document.body.style.overflow).toBe('hidden')
		view.unmount()
		expect(document.body.style.overflow).not.toBe('hidden')
	})

	it('снимает слушатель клавиатуры', () => {
		const onClose = vi.fn()
		const view = render(<Modal open onClose={onClose} title="Заголовок" />)
		view.unmount()
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).not.toHaveBeenCalled()
	})
})
// #endregion

// #region RC-06
describe('RC-06 Pagination', () => {
	it('помечает текущую страницу', () => {
		render(<Pagination total={5} page={3} onChange={vi.fn()} />)
		expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page')
		expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current')
	})

	it('края блокируют кнопки', () => {
		const { rerender } = render(<Pagination total={5} page={1} onChange={vi.fn()} />)
		expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled()
		rerender(<Pagination total={5} page={5} onChange={vi.fn()} />)
		expect(screen.getByRole('button', { name: 'Вперёд' })).toBeDisabled()
	})

	it('зовёт onChange с номером', () => {
		const onChange = vi.fn()
		render(<Pagination total={5} page={2} onChange={onChange} />)
		fireEvent.click(screen.getByRole('button', { name: '4' }))
		expect(onChange).toHaveBeenCalledWith(4)
		fireEvent.click(screen.getByRole('button', { name: 'Вперёд' }))
		expect(onChange).toHaveBeenCalledWith(3)
	})

	it('до семи страниц показывает все', () => {
		render(<Pagination total={7} page={1} onChange={vi.fn()} />)
		expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument()
		expect(screen.queryByText('…')).not.toBeInTheDocument()
	})

	it('длинный список схлопывается', () => {
		render(<Pagination total={20} page={10} onChange={vi.fn()} />)
		expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
		expect(screen.getAllByText('…')).toHaveLength(2)
	})
})
// #endregion

// #region RC-07
describe('RC-07 StarRating', () => {
	function Controlled() {
		const [value, setValue] = useState(0)
		return (
			<>
				<StarRating value={value} onChange={setValue} />
				<p>Оценка: {value}</p>
			</>
		)
	}

	it('выставляет оценку', () => {
		render(<Controlled />)
		fireEvent.click(screen.getByRole('button', { name: 'Оценка 4' }))
		expect(screen.getByText('Оценка: 4')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Оценка 3' })).toHaveAttribute('data-active', 'true')
		expect(screen.getByRole('button', { name: 'Оценка 5' })).toHaveAttribute('data-active', 'false')
	})

	it('повторный клик сбрасывает', () => {
		render(<Controlled />)
		fireEvent.click(screen.getByRole('button', { name: 'Оценка 3' }))
		fireEvent.click(screen.getByRole('button', { name: 'Оценка 3' }))
		expect(screen.getByText('Оценка: 0')).toBeInTheDocument()
	})

	it('подсветка по наведению и возврат после ухода', () => {
		render(<Controlled />)
		fireEvent.click(screen.getByRole('button', { name: 'Оценка 2' }))
		fireEvent.mouseEnter(screen.getByRole('button', { name: 'Оценка 5' }))
		expect(screen.getByRole('button', { name: 'Оценка 4' })).toHaveAttribute('data-active', 'true')
		fireEvent.mouseLeave(screen.getByRole('button', { name: 'Оценка 5' }).parentElement!)
		expect(screen.getByRole('button', { name: 'Оценка 4' })).toHaveAttribute('data-active', 'false')
	})
})
// #endregion

// #region RC-08
describe('RC-08 Autocomplete', () => {
	const options = ['Москва', 'Мурманск', 'Казань']

	it('список закрыт без ввода', () => {
		render(<Autocomplete options={options} onSelect={vi.fn()} />)
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('показывает совпадения', () => {
		render(<Autocomplete options={options} onSelect={vi.fn()} />)
		type('Город', 'му')
		expect(screen.getAllByRole('option')).toHaveLength(1)
		expect(screen.getByRole('option', { name: 'Мурманск' })).toBeInTheDocument()
	})

	it('стрелки двигают подсветку', () => {
		render(<Autocomplete options={options} onSelect={vi.fn()} />)
		const input = screen.getByLabelText('Город')
		fireEvent.change(input, { target: { value: 'м' } })
		expect(screen.getByRole('option', { name: 'Москва' })).toHaveAttribute('aria-selected', 'true')
		fireEvent.keyDown(input, { key: 'ArrowDown' })
		expect(screen.getByRole('option', { name: 'Мурманск' })).toHaveAttribute('aria-selected', 'true')
		fireEvent.keyDown(input, { key: 'ArrowUp' })
		expect(screen.getByRole('option', { name: 'Москва' })).toHaveAttribute('aria-selected', 'true')
	})

	it('Enter выбирает подсвеченное', () => {
		const onSelect = vi.fn()
		render(<Autocomplete options={options} onSelect={onSelect} />)
		const input = screen.getByLabelText('Город')
		fireEvent.change(input, { target: { value: 'м' } })
		fireEvent.keyDown(input, { key: 'ArrowDown' })
		fireEvent.keyDown(input, { key: 'Enter' })
		expect(onSelect).toHaveBeenCalledWith('Мурманск')
		expect((input as HTMLInputElement).value).toBe('Мурманск')
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('Escape закрывает и не меняет текст', () => {
		render(<Autocomplete options={options} onSelect={vi.fn()} />)
		const input = screen.getByLabelText('Город')
		fireEvent.change(input, { target: { value: 'м' } })
		fireEvent.keyDown(input, { key: 'Escape' })
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
		expect((input as HTMLInputElement).value).toBe('м')
	})

	it('клик по пункту выбирает', () => {
		const onSelect = vi.fn()
		render(<Autocomplete options={options} onSelect={onSelect} />)
		type('Город', 'каз')
		fireEvent.mouseDown(screen.getByRole('option', { name: 'Казань' }))
		expect(onSelect).toHaveBeenCalledWith('Казань')
	})
})
// #endregion

// #region RC-09
describe('RC-09 ShoppingCart', () => {
	const initial = [
		{ id: 'a', title: 'Болт', price: 50, qty: 2 },
		{ id: 'b', title: 'Гайка', price: 20, qty: 1 },
	]

	it('считает итог', () => {
		render(<ShoppingCart initial={initial} />)
		expect(screen.getByText('Итого: 120 ₽')).toBeInTheDocument()
		expect(screen.getByText('Позиций: 2')).toBeInTheDocument()
		expect(screen.getByText('Болт — 50 ₽ × 2 = 100 ₽')).toBeInTheDocument()
	})

	it('увеличивает количество', () => {
		render(<ShoppingCart initial={initial} />)
		fireEvent.click(screen.getByRole('button', { name: 'Больше Болт' }))
		expect(screen.getByText('Болт — 50 ₽ × 3 = 150 ₽')).toBeInTheDocument()
		expect(screen.getByText('Итого: 170 ₽')).toBeInTheDocument()
	})

	it('не опускает количество ниже единицы', () => {
		render(<ShoppingCart initial={initial} />)
		fireEvent.click(screen.getByRole('button', { name: 'Меньше Гайка' }))
		fireEvent.click(screen.getByRole('button', { name: 'Меньше Гайка' }))
		expect(screen.getByText('Гайка — 20 ₽ × 1 = 20 ₽')).toBeInTheDocument()
	})

	it('удаляет строку', () => {
		render(<ShoppingCart initial={initial} />)
		fireEvent.click(screen.getByRole('button', { name: 'Удалить Болт' }))
		expect(screen.queryByText(/Болт/)).not.toBeInTheDocument()
		expect(screen.getByText('Итого: 20 ₽')).toBeInTheDocument()
	})

	it('пустая корзина', () => {
		render(<ShoppingCart initial={[]} />)
		expect(screen.getByText('Корзина пуста')).toBeInTheDocument()
	})
})
// #endregion

// #region RC-10
describe('RC-10 SortableTable', () => {
	const columns = [
		{ key: 'name', title: 'Имя' },
		{ key: 'age', title: 'Возраст' },
	]
	const rows = [
		{ name: 'Борис', age: 30 },
		{ name: 'Анна', age: 9 },
		{ name: 'Виктор', age: 100 },
	]
	const columnValues = (index: number) =>
		screen.getAllByRole('row').slice(1).map(row => within(row).getAllByRole('cell')[index].textContent)

	it('без сортировки порядок исходный', () => {
		render(<SortableTable columns={columns} rows={rows} />)
		expect(columnValues(0)).toEqual(['Борис', 'Анна', 'Виктор'])
		expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'none')
	})

	it('первый клик сортирует по возрастанию', () => {
		render(<SortableTable columns={columns} rows={rows} />)
		fireEvent.click(screen.getByRole('button', { name: 'Имя' }))
		expect(columnValues(0)).toEqual(['Анна', 'Борис', 'Виктор'])
		expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending')
	})

	it('второй клик переворачивает', () => {
		render(<SortableTable columns={columns} rows={rows} />)
		fireEvent.click(screen.getByRole('button', { name: 'Имя' }))
		fireEvent.click(screen.getByRole('button', { name: 'Имя' }))
		expect(columnValues(0)).toEqual(['Виктор', 'Борис', 'Анна'])
		expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'descending')
	})

	it('числа сортируются как числа', () => {
		render(<SortableTable columns={columns} rows={rows} />)
		fireEvent.click(screen.getByRole('button', { name: 'Возраст' }))
		expect(columnValues(1)).toEqual(['9', '30', '100'])
	})

	it('не мутирует входные строки', () => {
		const snapshot = rows.map(row => row.name)
		render(<SortableTable columns={columns} rows={rows} />)
		fireEvent.click(screen.getByRole('button', { name: 'Имя' }))
		expect(rows.map(row => row.name)).toEqual(snapshot)
	})
})
// #endregion

// #region RC-11
describe('RC-11 FilterPanel', () => {
	const items = [
		{ id: 1, title: 'Болт', price: 50, inStock: true },
		{ id: 2, title: 'Гайка', price: 20, inStock: false },
		{ id: 3, title: 'Шайба', price: 5, inStock: true },
	]

	it('без фильтров показывает всё', () => {
		render(<FilterPanel items={items} />)
		expect(screen.getByText('Найдено: 3')).toBeInTheDocument()
	})

	it('фильтр по названию без учёта регистра', () => {
		render(<FilterPanel items={items} />)
		type('Название', 'БОЛТ')
		expect(screen.getByText('Найдено: 1')).toBeInTheDocument()
	})

	it('границы цены', () => {
		render(<FilterPanel items={items} />)
		type('Цена от', '10')
		type('Цена до', '50')
		expect(screen.getByText('Найдено: 2')).toBeInTheDocument()
	})

	it('выключенный чекбокс не фильтрует', () => {
		render(<FilterPanel items={items} />)
		expect(screen.getByLabelText('Только в наличии')).not.toBeChecked()
		expect(screen.getByText('Найдено: 3')).toBeInTheDocument()
	})

	it('включённый чекбокс фильтрует', () => {
		render(<FilterPanel items={items} />)
		fireEvent.click(screen.getByLabelText('Только в наличии'))
		expect(screen.getByText('Найдено: 2')).toBeInTheDocument()
	})

	it('сброс возвращает всё', () => {
		render(<FilterPanel items={items} />)
		type('Название', 'болт')
		fireEvent.click(screen.getByLabelText('Только в наличии'))
		fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))
		expect(screen.getByText('Найдено: 3')).toBeInTheDocument()
		expect((screen.getByLabelText('Название') as HTMLInputElement).value).toBe('')
	})
})
// #endregion

// #region RC-12
describe('RC-12 MultiStepForm', () => {
	it('первый шаг', () => {
		render(<MultiStepForm onSubmit={vi.fn()} />)
		expect(screen.getByRole('heading', { name: 'Контакты' })).toBeInTheDocument()
		expect(screen.getByText('Шаг 1 из 3')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled()
	})

	it('Далее заблокирована на пустом поле', () => {
		render(<MultiStepForm onSubmit={vi.fn()} />)
		expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled()
		type('Имя', 'Анна')
		expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled()
	})

	it('проходит все шаги и сохраняет данные при возврате', () => {
		const onSubmit = vi.fn()
		render(<MultiStepForm onSubmit={onSubmit} />)
		type('Имя', 'Анна')
		fireEvent.click(screen.getByRole('button', { name: 'Далее' }))
		expect(screen.getByText('Шаг 2 из 3')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
		expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('Анна')

		fireEvent.click(screen.getByRole('button', { name: 'Далее' }))
		type('Город', 'Москва')
		fireEvent.click(screen.getByRole('button', { name: 'Далее' }))
		expect(screen.getByRole('heading', { name: 'Готово' })).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', { name: 'Отправить' }))
		expect(onSubmit).toHaveBeenCalledWith({ name: 'Анна', city: 'Москва' })
	})
})
// #endregion

// #region RC-13
describe('RC-13 Countdown', () => {
	beforeEach(() => vi.useFakeTimers())
	const tick = async (ms: number) => {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ms)
		})
	}

	it('форматирует время', () => {
		render(<Countdown seconds={65} />)
		expect(screen.getByText('Осталось: 01:05')).toBeInTheDocument()
	})

	it('идёт после старта', async () => {
		render(<Countdown seconds={10} />)
		fireEvent.click(screen.getByRole('button', { name: 'Старт' }))
		await tick(3000)
		expect(screen.getByText('Осталось: 00:07')).toBeInTheDocument()
	})

	it('пауза останавливает', async () => {
		render(<Countdown seconds={10} />)
		fireEvent.click(screen.getByRole('button', { name: 'Старт' }))
		await tick(2000)
		fireEvent.click(screen.getByRole('button', { name: 'Пауза' }))
		await tick(5000)
		expect(screen.getByText('Осталось: 00:08')).toBeInTheDocument()
	})

	it('на нуле останавливается и зовёт onEnd один раз', async () => {
		const onEnd = vi.fn()
		render(<Countdown seconds={2} onEnd={onEnd} />)
		fireEvent.click(screen.getByRole('button', { name: 'Старт' }))
		await tick(5000)
		expect(screen.getByText('Осталось: 00:00')).toBeInTheDocument()
		expect(screen.getByText('Время вышло')).toBeInTheDocument()
		expect(onEnd).toHaveBeenCalledTimes(1)
	})

	it('сброс возвращает исходное', async () => {
		render(<Countdown seconds={10} />)
		fireEvent.click(screen.getByRole('button', { name: 'Старт' }))
		await tick(3000)
		fireEvent.click(screen.getByRole('button', { name: 'Сброс' }))
		expect(screen.getByText('Осталось: 00:10')).toBeInTheDocument()
	})

	it('чистит интервал при размонтировании', async () => {
		const view = render(<Countdown seconds={10} />)
		fireEvent.click(screen.getByRole('button', { name: 'Старт' }))
		await tick(1000)
		view.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
// #endregion

// #region RC-14
describe('RC-14 Toasts', () => {
	beforeEach(() => vi.useFakeTimers())
	const tick = async (ms: number) => {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ms)
		})
	}

	it('добавляет тосты по клику', () => {
		render(<Toasts ttl={1000} />)
		fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
		fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
		expect(screen.getByText('Сообщение 1')).toBeInTheDocument()
		expect(screen.getByText('Сообщение 2')).toBeInTheDocument()
		expect(screen.getAllByRole('status')).toHaveLength(2)
	})

	it('тост исчезает сам', async () => {
		render(<Toasts ttl={1000} />)
		fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
		await tick(1000)
		expect(screen.queryByText('Сообщение 1')).not.toBeInTheDocument()
	})

	it('крестик закрывает сразу', () => {
		render(<Toasts ttl={5000} />)
		fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть Сообщение 1' }))
		expect(screen.queryByText('Сообщение 1')).not.toBeInTheDocument()
	})

	it('чистит таймеры при размонтировании', () => {
		const view = render(<Toasts ttl={5000} />)
		fireEvent.click(screen.getByRole('button', { name: 'Показать' }))
		view.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
// #endregion

// #region RC-15
describe('RC-15 ThemeProvider', () => {
	it('показывает и переключает тему', () => {
		render(
			<ThemeProvider>
				<ThemeButton />
			</ThemeProvider>
		)
		expect(screen.getByRole('button', { name: 'Тема: light' })).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button'))
		expect(screen.getByRole('button', { name: 'Тема: dark' })).toBeInTheDocument()
	})

	it('пишет тему в data-атрибут', () => {
		render(
			<ThemeProvider initial="dark">
				<ThemeButton />
			</ThemeProvider>
		)
		expect(document.documentElement.dataset.theme).toBe('dark')
	})

	it('вне провайдера бросает понятную ошибку', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
		function Orphan() {
			useTheme()
			return null
		}
		expect(() => render(<Orphan />)).toThrow(/ThemeProvider/)
		spy.mockRestore()
	})
})
// #endregion

// #region RC-16
describe('RC-16 QuantityInput', () => {
	function Controlled({ min = 1, max = 5 }: { min?: number; max?: number }) {
		const [value, setValue] = useState(min)
		return <QuantityInput value={value} onChange={setValue} min={min} max={max} />
	}

	it('плюс и минус', () => {
		render(<Controlled />)
		fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect((screen.getByLabelText('Количество') as HTMLInputElement).value).toBe('2')
		fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		expect((screen.getByLabelText('Количество') as HTMLInputElement).value).toBe('1')
	})

	it('на границах кнопки выключены', () => {
		render(<Controlled min={1} max={2} />)
		expect(screen.getByRole('button', { name: 'Уменьшить' })).toBeDisabled()
		fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
	})

	it('нечисловой ввод игнорируется', () => {
		render(<Controlled />)
		const input = screen.getByLabelText('Количество') as HTMLInputElement
		fireEvent.change(input, { target: { value: 'абв' } })
		expect(input.value).toBe('1')
	})

	it('ввод числа зажимается по максимуму', () => {
		render(<Controlled min={1} max={5} />)
		const input = screen.getByLabelText('Количество') as HTMLInputElement
		fireEvent.change(input, { target: { value: '99' } })
		expect(input.value).toBe('5')
	})
})
// #endregion

// #region RC-17
describe('RC-17 PasswordStrength', () => {
	it('пустой пароль', () => {
		render(<PasswordStrength />)
		expect(screen.getByText('Введите пароль')).toBeInTheDocument()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
	})

	it('слабый пароль', () => {
		render(<PasswordStrength />)
		type('Пароль', 'abc')
		expect(screen.getByText('Слабый')).toBeInTheDocument()
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
	})

	it('средний пароль', () => {
		render(<PasswordStrength />)
		type('Пароль', 'Abcdefg1')
		expect(screen.getByText('Средний')).toBeInTheDocument()
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4')
	})

	it('надёжный пароль', () => {
		render(<PasswordStrength />)
		type('Пароль', 'Abcdefg1!')
		expect(screen.getByText('Надёжный')).toBeInTheDocument()
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5')
	})
})
// #endregion

// #region RC-18
describe('RC-18 CopyButton', () => {
	const stubClipboard = (writeText: (text: string) => Promise<void>) =>
		Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

	it('копирует и меняет надпись', async () => {
		const writeText = vi.fn(async () => {})
		stubClipboard(writeText)
		render(<CopyButton text="секрет" />)
		await act(async () => {
			fireEvent.click(screen.getByRole('button'))
		})
		expect(writeText).toHaveBeenCalledWith('секрет')
		expect(screen.getByRole('button', { name: 'Скопировано' })).toBeInTheDocument()
	})

	it('возвращает надпись через 2 секунды', async () => {
		vi.useFakeTimers()
		stubClipboard(async () => {})
		render(<CopyButton text="секрет" />)
		await act(async () => {
			fireEvent.click(screen.getByRole('button'))
		})
		await act(async () => {
			await vi.advanceTimersByTimeAsync(2000)
		})
		expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
	})

	it('ошибка показывает сообщение', async () => {
		stubClipboard(async () => {
			throw new Error('нет доступа')
		})
		render(<CopyButton text="секрет" />)
		await act(async () => {
			fireEvent.click(screen.getByRole('button'))
		})
		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось скопировать')
		expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument()
	})
})
// #endregion
