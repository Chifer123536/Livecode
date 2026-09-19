// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	Accordion,
	Badge,
	BatchCounter,
	CheckboxGroup,
	ColorSelect,
	Counter,
	DropdownMenu,
	EchoInput,
	FocusInput,
	FruitList,
	Hello,
	KeyedList,
	ListWithEmpty,
	PrevValue,
	ProfileForm,
	SearchForm,
	StatusBadge,
	StockFilter,
	Stopwatch,
	SumBox,
	TagList,
	Tabs,
	TitleCounter,
	Toggle,
	UserCard,
	ZeroTrap,
} from './tasks'

afterEach(() => {
	cleanup()
	// Страховка: если тест с фейковыми таймерами упал, не дать им утечь в следующие тесты —
	// userEvent ждёт setTimeout между событиями и на фейковых таймерах зависнет навсегда.
	vi.useRealTimers()
})

// #region RB-01
describe('RB-01 Hello', () => {
	it('подставляет имя', () => {
		render(<Hello name="мир" />)
		expect(screen.getByText('Привет, мир!')).toBeInTheDocument()
	})
	it('работает с другим именем', () => {
		render(<Hello name="Аня" />)
		expect(screen.getByText('Привет, Аня!')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-02
describe('RB-02 Badge', () => {
	it('показывает переданное значение', () => {
		render(<Badge count={5} />)
		expect(screen.getByText('Уведомлений: 5')).toBeInTheDocument()
	})
	it('без пропса берёт ноль', () => {
		render(<Badge />)
		expect(screen.getByText('Уведомлений: 0')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-03
describe('RB-03 UserCard', () => {
	it('рендерит имя, роль и children', () => {
		render(
			<UserCard name="Анна" role="фронтендер">
				<a href="#profile">профиль</a>
			</UserCard>
		)
		expect(screen.getByRole('heading', { name: 'Анна' })).toBeInTheDocument()
		expect(screen.getByText('фронтендер')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'профиль' })).toBeInTheDocument()
	})
	it('работает без children', () => {
		render(<UserCard name="Боб" role="qa" />)
		expect(screen.getByRole('heading', { name: 'Боб' })).toBeInTheDocument()
	})
})
// #endregion

// #region RB-04
describe('RB-04 Counter', () => {
	it('начинается с нуля', () => {
		render(<Counter />)
		expect(screen.getByText('Счёт: 0')).toBeInTheDocument()
	})
	it('увеличивается по клику', async () => {
		const user = userEvent.setup()
		render(<Counter />)
		await user.click(screen.getByRole('button', { name: '+1' }))
		await user.click(screen.getByRole('button', { name: '+1' }))
		expect(screen.getByText('Счёт: 2')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-05
describe('RB-05 Toggle', () => {
	it('изначально скрыто', () => {
		render(<Toggle />)
		expect(screen.queryByText('Секрет')).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Показать' })).toBeInTheDocument()
	})
	it('показывает и снова прячет', async () => {
		const user = userEvent.setup()
		render(<Toggle />)
		await user.click(screen.getByRole('button', { name: 'Показать' }))
		expect(screen.getByText('Секрет')).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Скрыть' }))
		expect(screen.queryByText('Секрет')).not.toBeInTheDocument()
	})
})
// #endregion

// #region RB-06
describe('RB-06 EchoInput', () => {
	it('пустое состояние', () => {
		render(<EchoInput />)
		expect(screen.getByText('ничего не введено')).toBeInTheDocument()
	})
	it('повторяет введённое', async () => {
		const user = userEvent.setup()
		render(<EchoInput />)
		await user.type(screen.getByLabelText('Имя'), 'Аня')
		expect(screen.getByText('Аня')).toBeInTheDocument()
	})
	it('инпут контролируемый', async () => {
		const user = userEvent.setup()
		render(<EchoInput />)
		const input = screen.getByLabelText('Имя') as HTMLInputElement
		await user.type(input, 'абв')
		expect(input.value).toBe('абв')
	})
})
// #endregion

// #region RB-07
describe('RB-07 FruitList', () => {
	it('рендерит все элементы', () => {
		render(<FruitList items={['яблоко', 'груша']} />)
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
		expect(screen.getByText('груша')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-08
describe('RB-08 ListWithEmpty', () => {
	it('показывает список', () => {
		render(<ListWithEmpty items={['раз']} />)
		expect(screen.getByRole('list')).toBeInTheDocument()
	})
	it('на пустом входе показывает заглушку и не рендерит ul', () => {
		render(<ListWithEmpty items={[]} />)
		expect(screen.getByText('Список пуст')).toBeInTheDocument()
		expect(screen.queryByRole('list')).not.toBeInTheDocument()
	})
})
// #endregion

// #region RB-09
describe('RB-09 StockFilter', () => {
	const products = [
		{ id: 1, title: 'Болт', inStock: true },
		{ id: 2, title: 'Гайка', inStock: false },
	]

	it('по умолчанию показывает всё', () => {
		render(<StockFilter products={products} />)
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
		expect(screen.getByText('Показано: 2')).toBeInTheDocument()
	})
	it('фильтрует по чекбоксу', async () => {
		const user = userEvent.setup()
		render(<StockFilter products={products} />)
		await user.click(screen.getByLabelText('только в наличии'))
		expect(screen.getAllByRole('listitem')).toHaveLength(1)
		expect(screen.getByText('Показано: 1')).toBeInTheDocument()
		expect(screen.queryByText('Гайка')).not.toBeInTheDocument()
	})
	it('фильтр снимается обратно', async () => {
		const user = userEvent.setup()
		render(<StockFilter products={products} />)
		const checkbox = screen.getByLabelText('только в наличии')
		await user.click(checkbox)
		await user.click(checkbox)
		expect(screen.getByText('Показано: 2')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-10
describe('RB-10 SumBox', () => {
	it('складывает два поля', async () => {
		const user = userEvent.setup()
		render(<SumBox />)
		await user.type(screen.getByLabelText('Первое'), '2')
		await user.type(screen.getByLabelText('Второе'), '3')
		expect(screen.getByText('Сумма: 5')).toBeInTheDocument()
	})
	it('пустые поля дают ноль', () => {
		render(<SumBox />)
		expect(screen.getByText('Сумма: 0')).toBeInTheDocument()
	})
	it('нечисловой ввод не даёт NaN', async () => {
		const user = userEvent.setup()
		render(<SumBox />)
		await user.type(screen.getByLabelText('Первое'), 'абв')
		expect(screen.getByText('Сумма: 0')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-11
describe('RB-11 BatchCounter', () => {
	it('плюс один', async () => {
		const user = userEvent.setup()
		render(<BatchCounter />)
		await user.click(screen.getByRole('button', { name: '+1' }))
		expect(screen.getByText('Счёт: 1')).toBeInTheDocument()
	})
	it('плюс три за один клик', async () => {
		const user = userEvent.setup()
		render(<BatchCounter />)
		await user.click(screen.getByRole('button', { name: '+3' }))
		expect(screen.getByText('Счёт: 3')).toBeInTheDocument()
	})
	it('два клика по +3 дают шесть', async () => {
		const user = userEvent.setup()
		render(<BatchCounter />)
		await user.click(screen.getByRole('button', { name: '+3' }))
		await user.click(screen.getByRole('button', { name: '+3' }))
		expect(screen.getByText('Счёт: 6')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-12
describe('RB-12 ProfileForm', () => {
	it('пустое состояние', () => {
		render(<ProfileForm />)
		expect(screen.getByText('— из —')).toBeInTheDocument()
	})
	it('оба поля обновляются независимо', async () => {
		const user = userEvent.setup()
		render(<ProfileForm />)
		await user.type(screen.getByLabelText('Имя'), 'Анна')
		await user.type(screen.getByLabelText('Город'), 'Москва')
		expect(screen.getByText('Анна из Москва')).toBeInTheDocument()
	})
	it('второе поле не стирает первое', async () => {
		const user = userEvent.setup()
		render(<ProfileForm />)
		await user.type(screen.getByLabelText('Имя'), 'Анна')
		await user.type(screen.getByLabelText('Город'), 'Тверь')
		expect((screen.getByLabelText('Имя') as HTMLInputElement).value).toBe('Анна')
	})
})
// #endregion

// #region RB-13
describe('RB-13 TagList', () => {
	it('добавляет тег и чистит поле', async () => {
		const user = userEvent.setup()
		render(<TagList />)
		const input = screen.getByLabelText('Тег') as HTMLInputElement
		await user.type(input, 'react')
		await user.click(screen.getByRole('button', { name: 'Добавить' }))
		expect(screen.getByText('react')).toBeInTheDocument()
		expect(input.value).toBe('')
	})
	it('не добавляет пробелы', async () => {
		const user = userEvent.setup()
		render(<TagList />)
		await user.type(screen.getByLabelText('Тег'), '   ')
		await user.click(screen.getByRole('button', { name: 'Добавить' }))
		expect(screen.queryAllByRole('listitem')).toHaveLength(0)
	})
	it('удаляет нужный тег', async () => {
		const user = userEvent.setup()
		render(<TagList />)
		const input = screen.getByLabelText('Тег')
		await user.type(input, 'react')
		await user.click(screen.getByRole('button', { name: 'Добавить' }))
		await user.type(input, 'vue')
		await user.click(screen.getByRole('button', { name: 'Добавить' }))
		await user.click(screen.getByRole('button', { name: 'Удалить react' }))
		expect(screen.queryByText('react')).not.toBeInTheDocument()
		expect(screen.getByText('vue')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-14
describe('RB-14 SearchForm', () => {
	it('отправляет по кнопке', async () => {
		const user = userEvent.setup()
		const onSearch = vi.fn()
		render(<SearchForm onSearch={onSearch} />)
		await user.type(screen.getByLabelText('Запрос'), 'болты')
		await user.click(screen.getByRole('button', { name: 'Найти' }))
		expect(onSearch).toHaveBeenCalledWith('болты')
	})
	it('отправляет по Enter', async () => {
		const user = userEvent.setup()
		const onSearch = vi.fn()
		render(<SearchForm onSearch={onSearch} />)
		await user.type(screen.getByLabelText('Запрос'), 'гайки{Enter}')
		expect(onSearch).toHaveBeenCalledWith('гайки')
	})
	it('обрезает пробелы и не шлёт пустое', async () => {
		const user = userEvent.setup()
		const onSearch = vi.fn()
		render(<SearchForm onSearch={onSearch} />)
		await user.type(screen.getByLabelText('Запрос'), '   {Enter}')
		expect(onSearch).not.toHaveBeenCalled()
		await user.type(screen.getByLabelText('Запрос'), '  шайба  {Enter}')
		expect(onSearch).toHaveBeenCalledWith('шайба')
	})
})
// #endregion

// #region RB-15
describe('RB-15 ColorSelect', () => {
	it('стартует с первого цвета', () => {
		render(<ColorSelect />)
		expect(screen.getByText('Выбрано: красный')).toBeInTheDocument()
	})
	it('меняет выбор', async () => {
		const user = userEvent.setup()
		render(<ColorSelect />)
		await user.selectOptions(screen.getByLabelText('Цвет'), 'синий')
		expect(screen.getByText('Выбрано: синий')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-16
describe('RB-16 CheckboxGroup', () => {
	const options = ['a', 'b', 'c']

	it('пустой выбор', () => {
		render(<CheckboxGroup options={options} />)
		expect(screen.getByText('Ничего не выбрано')).toBeInTheDocument()
	})
	it('выбирает несколько в порядке options', async () => {
		const user = userEvent.setup()
		render(<CheckboxGroup options={options} />)
		await user.click(screen.getByLabelText('c'))
		await user.click(screen.getByLabelText('a'))
		expect(screen.getByText('Выбрано: a, c')).toBeInTheDocument()
	})
	it('повторный клик снимает', async () => {
		const user = userEvent.setup()
		render(<CheckboxGroup options={options} />)
		await user.click(screen.getByLabelText('b'))
		await user.click(screen.getByLabelText('b'))
		expect(screen.getByText('Ничего не выбрано')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-17
describe('RB-17 Tabs', () => {
	const tabs = [
		{ id: 'a', title: 'Первая', content: 'Раз' },
		{ id: 'b', title: 'Вторая', content: 'Два' },
	]

	it('первая вкладка активна по умолчанию', () => {
		render(<Tabs tabs={tabs} />)
		expect(screen.getByRole('tab', { name: 'Первая' })).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByText('Раз')).toBeInTheDocument()
	})
	it('переключается', async () => {
		const user = userEvent.setup()
		render(<Tabs tabs={tabs} />)
		await user.click(screen.getByRole('tab', { name: 'Вторая' }))
		expect(screen.getByText('Два')).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: 'Первая' })).toHaveAttribute('aria-selected', 'false')
	})
	it('активна ровно одна', async () => {
		const user = userEvent.setup()
		render(<Tabs tabs={tabs} />)
		await user.click(screen.getByRole('tab', { name: 'Вторая' }))
		const selected = screen.getAllByRole('tab').filter(tab => tab.getAttribute('aria-selected') === 'true')
		expect(selected).toHaveLength(1)
	})
})
// #endregion

// #region RB-18
describe('RB-18 Accordion', () => {
	const sections = [
		{ id: 'a', title: 'Первая', body: 'Тело раз' },
		{ id: 'b', title: 'Вторая', body: 'Тело два' },
	]

	it('изначально всё закрыто', () => {
		render(<Accordion sections={sections} />)
		expect(screen.queryByText('Тело раз')).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Первая' })).toHaveAttribute('aria-expanded', 'false')
	})
	it('открывается одна и закрывает другую', async () => {
		const user = userEvent.setup()
		render(<Accordion sections={sections} />)
		await user.click(screen.getByRole('button', { name: 'Первая' }))
		expect(screen.getByText('Тело раз')).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Вторая' }))
		expect(screen.queryByText('Тело раз')).not.toBeInTheDocument()
		expect(screen.getByText('Тело два')).toBeInTheDocument()
	})
	it('повторный клик закрывает', async () => {
		const user = userEvent.setup()
		render(<Accordion sections={sections} />)
		const head = screen.getByRole('button', { name: 'Первая' })
		await user.click(head)
		await user.click(head)
		expect(screen.queryByText('Тело раз')).not.toBeInTheDocument()
	})
})
// #endregion

// #region RB-19
describe('RB-19 ZeroTrap', () => {
	it('показывает количество', () => {
		render(<ZeroTrap count={3} />)
		expect(screen.getByText('Товаров: 3')).toBeInTheDocument()
	})
	it('на нуле не рендерит ноль', () => {
		const { container } = render(<ZeroTrap count={0} />)
		expect(container.textContent).toBe('')
	})
})
// #endregion

// #region RB-20
describe('RB-20 StatusBadge', () => {
	it('переводит известные статусы', () => {
		render(<StatusBadge status="paid" />)
		expect(screen.getByText('Оплачен')).toBeInTheDocument()
	})
	it('неизвестный статус', () => {
		render(<StatusBadge status="weird" />)
		expect(screen.getByText('Неизвестно')).toBeInTheDocument()
	})
	it('кладёт data-status', () => {
		render(<StatusBadge status="new" />)
		expect(screen.getByText('Новый')).toHaveAttribute('data-status', 'new')
	})
})
// #endregion

// #region RB-21
describe('RB-21 TitleCounter', () => {
	it('пишет счёт в заголовок', async () => {
		const user = userEvent.setup()
		render(<TitleCounter />)
		expect(document.title).toBe('0')
		await user.click(screen.getByRole('button', { name: '+1' }))
		expect(document.title).toBe('1')
	})
	it('возвращает заголовок при размонтировании', () => {
		const view = render(<TitleCounter />)
		view.unmount()
		expect(document.title).toBe('Livecode')
	})
})
// #endregion

// #region RB-22
describe('RB-22 FocusInput', () => {
	it('переводит фокус в инпут', async () => {
		const user = userEvent.setup()
		render(<FocusInput />)
		const input = screen.getByLabelText('Поиск')
		expect(input).not.toHaveFocus()
		await user.click(screen.getByRole('button', { name: 'Фокус' }))
		expect(input).toHaveFocus()
	})
})
// #endregion

// #region RB-23
describe('RB-23 Stopwatch', () => {
	/**
	 * Здесь намеренно fireEvent, а не userEvent: userEvent ставит собственные задержки
	 * через setTimeout, и на фейковых таймерах его await зависает навсегда.
	 * Правило: тест про таймеры — fireEvent; тест про поведение пользователя — userEvent.
	 */
	const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
	const tick = async (ms: number) => {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(ms)
		})
	}

	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('стартует с нуля', () => {
		render(<Stopwatch />)
		expect(screen.getByText('Прошло: 0 с')).toBeInTheDocument()
	})

	it('тикает после старта', async () => {
		render(<Stopwatch />)
		click('Старт')
		await tick(3000)
		expect(screen.getByText('Прошло: 3 с')).toBeInTheDocument()
	})

	it('пауза останавливает счёт', async () => {
		render(<Stopwatch />)
		click('Старт')
		await tick(2000)
		click('Пауза')
		await tick(5000)
		expect(screen.getByText('Прошло: 2 с')).toBeInTheDocument()
	})

	it('сброс обнуляет', async () => {
		render(<Stopwatch />)
		click('Старт')
		await tick(2000)
		click('Сброс')
		expect(screen.getByText('Прошло: 0 с')).toBeInTheDocument()
	})

	it('после размонтирования живых таймеров не остаётся', async () => {
		const view = render(<Stopwatch />)
		click('Старт')
		await tick(1000)
		view.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
// #endregion

// #region RB-24
describe('RB-24 PrevValue', () => {
	it('до первого изменения прочерк', () => {
		render(<PrevValue />)
		expect(screen.getByText('Сейчас: 0, было: —')).toBeInTheDocument()
	})
	it('показывает предыдущее значение', async () => {
		const user = userEvent.setup()
		render(<PrevValue />)
		await user.click(screen.getByRole('button', { name: '+1' }))
		expect(screen.getByText('Сейчас: 1, было: 0')).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: '+1' }))
		expect(screen.getByText('Сейчас: 2, было: 1')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-25
describe('RB-25 DropdownMenu', () => {
	const items = ['Профиль', 'Выйти']

	it('открывается по кнопке', async () => {
		const user = userEvent.setup()
		render(<DropdownMenu items={items} />)
		expect(screen.queryByRole('list')).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Меню' }))
		expect(screen.getByRole('list')).toBeInTheDocument()
	})
	it('закрывается по клику снаружи', async () => {
		const user = userEvent.setup()
		render(<DropdownMenu items={items} />)
		await user.click(screen.getByRole('button', { name: 'Меню' }))
		fireEvent.mouseDown(document.body)
		expect(screen.queryByRole('list')).not.toBeInTheDocument()
	})
	it('клик внутри меню не закрывает', async () => {
		const user = userEvent.setup()
		render(<DropdownMenu items={items} />)
		await user.click(screen.getByRole('button', { name: 'Меню' }))
		fireEvent.mouseDown(screen.getByText('Профиль'))
		expect(screen.getByRole('list')).toBeInTheDocument()
	})
})
// #endregion

// #region RB-26
describe('RB-26 KeyedList', () => {
	const initial = [
		{ id: 'a', title: 'Первая' },
		{ id: 'b', title: 'Вторая' },
	]

	it('удаляет первую', async () => {
		const user = userEvent.setup()
		render(<KeyedList initial={initial} />)
		await user.click(screen.getByRole('button', { name: 'Удалить первую' }))
		expect(screen.queryByText('Первая')).not.toBeInTheDocument()
		expect(screen.getByText('Вторая')).toBeInTheDocument()
	})

	it('состояние чекбокса не переезжает на соседа (ловушка key={index})', async () => {
		const user = userEvent.setup()
		render(<KeyedList initial={initial} />)
		await user.click(screen.getByLabelText('Вторая'))
		expect(screen.getByLabelText('Вторая')).toBeChecked()

		await user.click(screen.getByRole('button', { name: 'Удалить первую' }))
		expect(screen.getByLabelText('Вторая')).toBeChecked()
	})
})
// #endregion
