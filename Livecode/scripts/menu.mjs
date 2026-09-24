#!/usr/bin/env node
/**
 * Интерактивное меню тренажёра.
 *
 *   yarn menu
 *
 * Клавиши: ↑↓ — выбор, Enter — открыть, ◂ ▸ — соседняя задача (или значение настройки),
 * / — поиск, Esc — назад, q — выход. Ctrl+C — назад, с первого экрана — выход.
 *
 * Под меню — консоль. ↓ с последнего пункта (или Tab) переводит в неё фокус, ↑ возвращает.
 * В ней работают и команды тренажёра, и любые команды PowerShell. Пункты меню, которым
 * нужен вывод команды — прогресс, сброс, инструменты, watch, — тоже выполняются в ней.
 * «Решать» открывает VS Code, условие, проверка и разбор — экраны внутри меню.
 * Экран терминала меню не покидает никогда.
 *
 * Меню живёт в дополнительном буфере экрана и рисует кадр поверх предыдущего:
 * только изменившиеся строки, одной записью в режиме синхронного вывода.
 * Любая ошибка внутри не роняет процесс: пишется в лог и показывается строкой внизу.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { renderCard, stateLine } from './card.mjs'
import { createConsole } from './console.mjs'
import { openInEditor } from './editor.mjs'
import {
	allTasks,
	applyUi,
	bar,
	BG_RESET,
	bgCode,
	c,
	CACHE_DIR,
	DEFAULT_UI,
	entryOf,
	fileOf,
	findTask,
	firstUnsolved,
	isTaskStale,
	loadPacks,
	padEnd,
	palette,
	percentOf,
	readCurrent,
	readProgress,
	relativePath,
	ROOT,
	saveUi,
	staleTasks,
	statusOf,
	strip,
	ui,
	visibleWidth,
	writeCurrent,
} from './lib.mjs'
import { renderManyResults, renderRunError, renderTaskResult } from './report.mjs'
import {
	ensure as ensureShell,
	install as installShell,
	uninstall as uninstallShell,
} from './shell/install.mjs'
import { checkTargets } from './state.mjs'
import { BARS, CONTRAST, findTheme, THEMES } from './theme.mjs'
import { cell, clip, GUTTER, key, line, mark, row, stars, starsCell } from './ui.mjs'
import { loadWalkthroughs, renderWalkthrough } from './walkthrough.mjs'

const HIDE = '\x1b[?25l'
const SHOW = '\x1b[?25h'
/** Дополнительный буфер экрана: меню живёт в нём, история терминала остаётся целой. */
const ALT_ON = '\x1b[?1049h'
const ALT_OFF = '\x1b[?1049l'
/** Стереть строку от курсора вправо. */
const ERASE = '\x1b[K'
/** Синхронный вывод: терминал придержит кадр, пока он не собран целиком. */
const SYNC_ON = '\x1b[?2026h'
const SYNC_OFF = '\x1b[?2026l'

const ERROR_LOG = path.join(CACHE_DIR, 'menu-errors.log')

if (!process.stdin.isTTY) {
	console.log(c.yellow('Меню работает только в интерактивном терминале.'))
	console.log(c.gray('Запусти из обычной консоли: yarn menu'))
	process.exit(1)
}

// ── состояние ──────────────────────────────────────────────────────────

let packs = loadPacks()
let progress = readProgress()
let current = readCurrent()

/**
 * Стек экранов. Запись: { kind, build, pack, task, cursor, scroll, lines }.
 * build(запись) строит экран заново на каждый кадр — после команды прогресс
 * и текущая задача уже другие. pack/task хранятся в записи, поэтому ◂ ▸
 * переключают задачу простой заменой полей, без пересборки стека.
 */
const stack = []
let selected = 0
let message = ''
let filter = ''
let filtering = false
/** Пока идёт проверка внутри меню, клавиши молчат. */
let busy = false

/** Куда идут клавиши: в меню или в консоль под ним. Переход — стрелкой ↓ с конца и ↑ обратно. */
let focus = 'menu'

const con = createConsole({
	onChange: () => scheduleRender(),
	// Команда могла сдать задачу, сбросить пак или пересчитать прогресс.
	onDone: () => {
		reload()
		scheduleRender()
	},
	ids: () => [...packs.map(pack => pack.code), ...allTasks(packs).map(({ task }) => task.id)],
})

/** Выполнить команду в консоли и перевести туда фокус — вывод можно сразу листать. */
function runInConsole(line) {
	focus = 'console'
	message = ''
	con.run(line, width())
}

// ── размеры ────────────────────────────────────────────────────────────

const cols = () => Math.max(44, process.stdout.columns ?? 80)
const rows = () => Math.max(12, process.stdout.rows ?? 24)

/** Подложка кроет весь экран. */
const panelWidth = () => cols()

/**
 * Колонка с содержимым уже экрана: на широком мониторе тащить взгляд
 * от названия к полосе через всю ширину неудобно.
 */
const width = () => Math.max(44, Math.min(cols() - 6, 104))

// ── задачи ─────────────────────────────────────────────────────────────

const top = () => stack[stack.length - 1]
const active = () => top().build(top())

/** Задача, на которую нацелены пункты главного экрана. */
function focused() {
	return (current && findTask(packs, current)) || firstUnsolved(packs, progress)
}

/** Соседняя задача в общем порядке прохождения, через границы паков. */
function neighborTask(task, delta) {
	const order = allTasks(packs)
	const index = order.findIndex(entry => entry.task.id === task.id)
	if (index === -1) return null
	return order[index + delta] ?? null
}

function neighborPack(pack, delta) {
	const index = packs.findIndex(entry => entry.code === pack.code)
	return packs[index + delta] ?? null
}

/** Свежая версия задачи: после перечитывания паков старые объекты устаревают. */
function fresh(pack, task) {
	return findTask(packs, task.id) ?? { pack, task }
}

// ── отрисовка ──────────────────────────────────────────────────────────

function header() {
	const total = packs.reduce((sum, pack) => sum + pack.tasks.size, 0)
	const done = packs.reduce(
		(sum, pack) =>
			sum + [...pack.tasks.keys()].filter(id => statusOf(progress, id) === 'pass').length,
		0,
	)
	const percent = percentOf(done, total)

	const out = ['']
	out.push(
		row(
			GUTTER.top,
			c.bold(palette.accent('ТРЕНАЖЁР')) +
				palette.surface('  ·  ') +
				palette.faint('livecode drills'),
		),
	)
	out.push(line())

	const counter = c.bold(palette.ink(String(done))) + palette.faint(`/${total}`)
	const tail = percent === 100 ? palette.mint('всё сдано') : palette.faint(`${percent}%`)
	out.push(line(bar(done, total, 28) + '  ' + counter + '  ' + tail))

	const stale = staleTasks(packs, progress).length
	if (stale > 0) {
		out.push(
			line(
				palette.amber('⟳ ') +
					palette.faint(`изменены после проверки: ${stale} — результат устарел, нужна «Проверить»`),
			),
		)
	}
	return out
}

/** Список с окном прокрутки: длинные паки не должны выезжать за экран. */
function renderList(items, cursor, height) {
	const visible = Math.max(3, Math.min(height, items.length))
	let start = 0
	if (items.length > visible) {
		start = Math.min(Math.max(0, cursor - Math.floor(visible / 2)), items.length - visible)
	}

	const inner = width()
	const out = []
	if (items.length === 0) out.push(line(palette.surface('ничего не найдено')))
	if (start > 0) out.push(line(palette.surface(`↑ ещё ${start}`)))

	for (let index = start; index < start + visible && index < items.length; index += 1) {
		const entry = items[index]

		if (entry.separator) {
			out.push(entry.raw ? entry.label : line(palette.surface(entry.label)))
			continue
		}

		const body = entry.right
			? padEnd(entry.label, inner - visibleWidth(entry.right) - 3) + '  ' + entry.right
			: entry.label

		if (index === cursor) {
			// Подложка ровно по ширине панели: иначе за ней остаётся прозрачный хвост.
			out.push(
				// Фокус в консоли — курсор меню остаётся на месте, но гаснет.
				'  ' +
					(focus === 'menu' ? palette.accent('▌▸') : palette.surface('▌▸')) +
					palette.select(' ' + padEnd(body, panelWidth() - 5), { bg: true }),
			)
		} else {
			out.push('  ' + palette.faint(GUTTER.line) + '  ' + body)
		}
	}

	const rest = items.length - (start + visible)
	if (rest > 0) out.push(line(palette.surface(`↓ ещё ${rest}`)))
	return out
}

/** Клавиша и её смысл одной подписью. */
const chip = (label, about) => key(label) + palette.faint(' ' + about)

function footer(screen, extra = '') {
	const keys = []

	if (focus === 'console') {
		keys.push(
			chip('⏎', 'выполнить'),
			chip('⇥', 'дополнить'),
			chip('↑', 'в меню'),
			chip('^↑↓', 'история'),
			chip('PgUp PgDn', 'вывод'),
			chip('^C', con.running ? 'остановить' : 'очистить'),
		)
		const out = [
			line(
				palette.surface(
					'ok BAS-08 · how · go · task · progress · clean · test — и любые команды PowerShell',
				),
			),
		]
		out.push('  ' + palette.faint(GUTTER.end) + '  ' + keys.join('   '))
		if (message) out.push('  ' + message)
		return out
	}

	if (screen.doc) {
		keys.push(chip('↑↓', 'листать'))
		if (screen.enter) keys.push(chip('⏎', screen.enter.label))
	} else {
		keys.push(chip('↑↓', 'выбор'), chip('⏎', 'открыть'))
	}

	const item = screen.doc ? null : visibleItems(screen)[selected]
	if (item?.onLeft) keys.push(chip('◂ ▸', 'значение'))
	else if (screen.swap) keys.push(chip('◂ ▸', screen.swap.label))

	if (screen.filterable) keys.push(chip('/', 'поиск'))
	if (stack.length > 1) keys.push(chip('esc', 'назад'))
	keys.push(chip('q', 'выход'))

	const out = []
	if (filtering || filter) {
		out.push(
			line(
				palette.accent('поиск: ') +
					c.bold(palette.ink(filter || ' ')) +
					palette.surface(filtering ? '▏  ⏎ — применить, esc — сбросить' : '   esc — сбросить'),
			),
		)
	} else {
		const hint = [screen.hint, extra].filter(Boolean).join('   ')
		out.push(line(palette.surface(hint)))
	}
	out.push('  ' + palette.faint(GUTTER.end) + '  ' + keys.join('   '))
	if (message) out.push('  ' + message)
	return out
}

/** Видимые пункты с учётом поиска. Разделители при поиске отбрасываются. */
function visibleItems(screen) {
	if (!screen.items) return []
	if (!filter || !screen.filterable) return screen.items
	const needle = filter.toLowerCase()
	return screen.items.filter(
		entry =>
			!entry.separator &&
			strip(entry.search ?? entry.label)
				.toLowerCase()
				.includes(needle),
	)
}

/**
 * Документ (условие, разбор, результат) в окне высотой `height`.
 * Запоминает в записи стека границу прокрутки и размер страницы — по ним
 * клавиши решают, листать дальше или уходить в консоль.
 */
function renderDoc(screen, height) {
	const entry = top()
	const body = Math.max(1, height - 1)
	const max = Math.max(0, screen.doc.length - body)
	entry.scroll = Math.min(Math.max(0, entry.scroll ?? 0), max)
	entry.maxScroll = max
	entry.page = Math.max(1, body - 2)

	const shown = screen.doc.slice(entry.scroll, entry.scroll + body)
	const position =
		screen.doc.length > body
			? `строки ${entry.scroll + 1}–${entry.scroll + shown.length} из ${screen.doc.length}`
			: ''
	return { lines: ['', ...shown], position }
}

function renderMenuArea(screen, height) {
	const items = visibleItems(screen)
	if (selected >= items.length) selected = Math.max(0, items.length - 1)
	if (items[selected]?.separator) selected = firstSelectable(items)

	const head = [...header(), line()]
	if (screen.title) {
		head.push(row(GUTTER.node, c.bold(palette.ink(screen.title))))
		head.push(line())
	}
	// Две строки в запасе: renderList добавляет «↑ ещё N» и «↓ ещё N».
	const room = Math.max(3, height - head.length - 2)
	return [...head, ...renderList(items, selected, room)]
}

// ── консоль под меню ───────────────────────────────────────────────────

/** Строка ввода: подсказка без фокуса, текст с курсором в фокусе. */
function inputLine() {
	const { input, cursor } = con.state
	const active = focus === 'console'
	const prompt = active ? c.bold(palette.accent('❯ ')) : palette.faint('❯ ')

	if (!active && !input) {
		return line(prompt + palette.surface('↓ сюда — писать команды: ok BAS-08, how, git status…'))
	}

	const room = Math.max(10, width() - 4)
	// Длинная строка едет вместе с курсором: видно окно вокруг него.
	const start = Math.max(0, cursor - room + 1)
	const visibleText = input.slice(start, start + room)
	const at = cursor - start

	if (!active) return line(prompt + palette.faint(visibleText))
	const under = visibleText[at] ?? ' '
	return line(
		prompt +
			palette.snow(visibleText.slice(0, at)) +
			'\x1b[7m' +
			palette.snow(under) +
			'\x1b[27m' +
			palette.snow(visibleText.slice(at + 1)),
	)
}

/** Строка вывода консоли: обычный текст команды, эхо ввода или служебная пометка. */
function consoleEntry(entry) {
	if (typeof entry === 'string') return line(entry)
	if (entry.prompt !== undefined) {
		const where =
			entry.cwd && entry.cwd !== ROOT ? palette.surface(relativePath(entry.cwd) + ' ') : ''
		return line(where + palette.accent('❯ ') + palette.ink(entry.prompt))
	}
	return line((palette[entry.color] ?? palette.faint)(entry.note))
}

/**
 * Блок консоли: разделитель с состоянием, хвост вывода, строка ввода.
 * Высота вывода фиксирована долей экрана — фокус её не меняет, иначе меню
 * прыгало бы при каждом переходе стрелкой.
 */
function consoleBlock() {
	const out = []
	const active = focus === 'console'
	const title = active ? c.bold(palette.accent('консоль')) : palette.faint('консоль')

	let status = ''
	if (con.running) {
		const frame = SPIN[Math.floor(Date.now() / 90) % SPIN.length]
		const seconds = ((Date.now() - con.state.started) / 1000).toFixed(1)
		status =
			palette.accent(frame) +
			' ' +
			palette.faint(con.state.command) +
			palette.surface(`  ${seconds}с`)
	} else if (con.state.status) {
		status = con.state.status.startsWith('✓')
			? palette.mint(con.state.status)
			: palette.rose(con.state.status)
	}
	if (con.state.scroll > 0) status += palette.amber(`  ↑ прокручено на ${con.state.scroll}`)

	const rule = palette.surface('─'.repeat(Math.max(2, width() - visibleWidth(strip(title)) - 8)))
	out.push('  ' + palette.faint(GUTTER.fork) + palette.surface('─ ') + title + ' ' + rule)
	if (status) out.push(line(status))

	const room = Math.max(3, Math.floor(rows() * 0.3))
	for (const entry of con.visible(room)) out.push(consoleEntry(entry))
	out.push(inputLine())
	if (con.state.hint) out.push(line(palette.surface(con.state.hint)))
	return out
}

function render() {
	const screen = active()
	const total = rows()

	const block = consoleBlock()
	const footLines = footer(screen).length
	const room = Math.max(4, total - footLines - block.length)

	let area
	let position = ''
	if (screen.doc) {
		const doc = renderDoc(screen, room)
		area = doc.lines
		position = doc.position
	} else {
		area = renderMenuArea(screen, room)
	}

	// Добиваем до консоли направляющей: столбец должен доходить донизу.
	while (area.length < room) area.push(line())
	area.length = room

	const frame = [...area, ...block, ...footer(screen, position)]
	frame.length = total
	paint(frame.map(panelize))
}

/** Отрисовка не чаще раза в 30 мс: вывод команды может приходить сотнями кусков. */
let renderTimer = null
function scheduleRender() {
	if (renderTimer) return
	renderTimer = setTimeout(() => {
		renderTimer = null
		try {
			render()
		} catch (error) {
			reportError(error)
		}
	}, 30)
}

/**
 * Готовая к печати строка кадра. Подложка ставится ПЕРЕД текстом и тянется
 * до конца строки, а сброс вложенных фонов подменяется цветом панели —
 * ни в один момент ячейка не остаётся с фоном терминала.
 */
function panelize(text) {
	// Ширину диктует окно, поэтому длинные строки режутся, а не переносятся.
	const body = clip(text ?? '', panelWidth())
	const fill = ui.panel ? bgCode('panel') : ''
	// Без подложки чистим хвост строки сами: закрашивать нечем.
	if (!fill) return body + ERASE
	// Любой SGR, который сбрасывает фон — `0`, пустой или `49`, — возвращает цвет панели.
	// Вывод чужих команд в консоли сбрасывает цвета как угодно, не только через 49.
	const padded = padEnd(body, panelWidth()).replace(/\x1b\[([0-9;]*)m/g, (sequence, params) => {
		const codes = params === '' ? ['0'] : params.split(';')
		return codes.includes('0') || codes.includes('49') ? sequence + fill : sequence
	})
	return fill + padded
}

/**
 * Печать кадра. Синхронный вывод — терминал не покажет кадр недособранным.
 * Перерисовываются только изменившиеся строки: стрелка трогает две строки из полусотни.
 * Очистки экрана нет вообще — именно она давала вспышку фона.
 */
let painted = []
let paintedSize = ''

function paint(frame) {
	const size = `${cols()}x${rows()}`
	const full = size !== paintedSize || painted.length !== frame.length

	let out = SYNC_ON + HIDE
	frame.forEach((text, index) => {
		if (!full && painted[index] === text) return
		out += `\x1b[${index + 1};1H` + text
	})
	out += BG_RESET + SYNC_OFF

	painted = frame
	paintedSize = size
	process.stdout.write(out)
}

/** Забыть нарисованное: следующий кадр ляжет целиком. */
function forgetFrame() {
	painted = []
	paintedSize = ''
}

// ── ошибки ─────────────────────────────────────────────────────────────

/** Записать ошибку в лог и вернуть путь до него — для строки в меню. */
function logError(error) {
	try {
		fs.mkdirSync(CACHE_DIR, { recursive: true })
		fs.appendFileSync(
			ERROR_LOG,
			`\n[${new Date().toISOString()}]\n${error?.stack ?? String(error)}\n`,
		)
	} catch {
		/* лог — подспорье, а не условие работы */
	}
	return relativePath(ERROR_LOG)
}

/** Вернуть терминал в человеческое состояние. Безопасно вызывать сколько угодно раз. */
function restoreTerminal() {
	try {
		process.stdin.setRawMode?.(false)
	} catch {
		/* поток уже закрыт */
	}
	try {
		process.stdout.write(SYNC_OFF + BG_RESET + '\x1b[0m' + SHOW + ALT_OFF)
	} catch {
		/* писать уже некуда */
	}
}

/** Ошибка внутри действия: меню живёт дальше, причина видна и лежит в логе. */
function reportError(error) {
	busy = false
	const log = logError(error)
	message =
		palette.rose('✗ ') +
		palette.ink(String(error?.message ?? error).split('\n')[0]) +
		palette.surface(`   подробности: ${log}`)
	try {
		forgetFrame()
		render()
	} catch (fatal) {
		crash(fatal)
	}
}

/** Совсем плохо: отрисовать не выходит. Чиним терминал и выходим с понятным текстом. */
function crash(error) {
	const log = logError(error)
	restoreTerminal()
	console.log('')
	console.log(row(GUTTER.end, palette.rose('Меню упало: ') + String(error?.message ?? error)))
	console.log(row(GUTTER.end, palette.faint('подробности: ') + palette.ink(log)))
	console.log('')
	process.exit(1)
}

// ── запуск внешних команд ──────────────────────────────────────────────

/** Перечитать всё, что могли поменять команды и проверки. */
function reload() {
	packs = loadPacks()
	progress = readProgress()
	current = readCurrent()
	for (const entry of stack) {
		if (entry.pack && entry.task) Object.assign(entry, fresh(entry.pack, entry.task))
		else if (entry.pack)
			entry.pack = packs.find(pack => pack.code === entry.pack.code) ?? entry.pack
	}
}

/** Команда без вывода на экран: меню не уходит, результат — строкой внизу. */
function runQuiet(name, extra = []) {
	const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', name), ...extra], {
		cwd: ROOT,
		stdio: 'ignore',
		windowsHide: true,
	})
	reload()
	return result.status === 0
}

// ── действия над задачей ───────────────────────────────────────────────

/** Сделать задачу текущей: на неё смотрят `yarn ok` и `yarn how` без аргументов. */
function pickTask(task) {
	current = task.id
	writeCurrent(task.id)
}

/** Открыть в VS Code, не выходя из меню. */
function openTask(pack, task) {
	pickTask(task)
	message = openInEditor(fileOf(pack, task), task.startLine + 1)
		? palette.mint('✓ ') + palette.ink(`${task.id} открыта в VS Code`)
		: palette.amber('VS Code не найден — открой ') + palette.ink(relativePath(fileOf(pack, task)))
}

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * Проверка внутри меню. Тесты идут в фоне, крутилка — строкой в подвале,
 * результат открывается экраном. `into` — запись стека, куда положить результат
 * (перепроверка и ◂ ▸ на экране результата), иначе результат открывается новым экраном.
 */
async function check(targets, { whole = false, scope = null, into = null } = {}) {
	busy = true
	const label = whole
		? 'проверяю весь тренажёр — это долго'
		: scope
			? `проверяю пак ${scope.code}`
			: `проверяю ${targets[0].task.id}`

	let frame = 0
	const tick = () => {
		message = palette.accent(SPIN[frame++ % SPIN.length]) + '  ' + palette.faint(label)
		try {
			render()
		} catch (error) {
			logError(error)
		}
	}
	tick()
	const timer = setInterval(tick, 90)

	let outcome
	try {
		outcome = await checkTargets(packs, targets, { whole })
	} finally {
		clearInterval(timer)
		message = ''
		busy = false
	}

	progress = outcome.progress
	const single = targets.length === 1 && !whole && !scope
	if (single) pickTask(targets[0].task)

	const lines = outcome.error
		? renderRunError(outcome.error)
		: single
			? renderTaskResult(outcome.results[0], { elapsed: outcome.elapsed })
			: renderManyResults(outcome.results, {
					packs,
					scope,
					elapsed: outcome.elapsed,
					width: width(),
				})

	if (into) {
		into.lines = lines
		into.scroll = 0
		return
	}

	const [first] = targets
	push('result', resultScreen, {
		pack: single ? first.pack : scope,
		task: single ? first.task : null,
		lines,
		recheck: { targets, whole, scope },
	})
}

// ── навигация ──────────────────────────────────────────────────────────

/** Первый пункт, на который можно встать: разделители пропускаем. */
function firstSelectable(items) {
	const index = items.findIndex(entry => !entry.separator)
	return index === -1 ? 0 : index
}

function push(kind, build, extra = {}) {
	// Запоминаем, где стояли: при возврате список откроется на том же месте.
	if (stack.length > 0) top().cursor = selected
	stack.push({ kind, build, scroll: 0, ...extra })
	filter = ''
	filtering = false
	message = ''
	const screen = active()
	selected = screen.doc ? 0 : firstSelectable(visibleItems(screen))
}

function back() {
	if (filter || filtering) {
		filter = ''
		filtering = false
		selected = firstSelectable(visibleItems(active()))
		return
	}
	// С первого экрана назад некуда. Выход — только q, Ctrl+C или пункт «Выход».
	if (stack.length === 1) return

	stack.pop()
	message = ''
	const screen = active()
	selected = screen.doc ? 0 : (top().cursor ?? firstSelectable(visibleItems(screen)))
}

/**
 * Переключить весь стек на другую задачу: экран задачи, её условие, разбор,
 * а список пака под ними — на пак новой задачи с курсором на ней.
 * Esc после ▸ ведёт туда, куда и ожидаешь, — к новой задаче, а не к старой.
 */
function retarget(pack, task) {
	for (const entry of stack) {
		if (entry.kind === 'tasks') {
			entry.pack = pack
			const items = tasksScreen(entry).items
			entry.cursor = Math.max(
				0,
				items.findIndex(item => item.taskId === task.id),
			)
		} else if (entry.task) {
			entry.pack = pack
			entry.task = task
			entry.scroll = 0
		}
	}
	pickTask(task)
}

/** ◂ ▸ на экране: соседняя задача, соседний пак или фокус главного экрана. */
async function swap(delta) {
	const entry = top()

	if (entry.kind === 'main') {
		const target = focused()
		const next = target && neighborTask(target.task, delta)
		if (next) pickTask(next.task)
		return
	}

	if (entry.kind === 'tasks') {
		const next = neighborPack(entry.pack, delta)
		if (!next) return
		entry.pack = next
		selected = firstSelectable(visibleItems(active()))
		return
	}

	if (!entry.task) return
	const next = neighborTask(entry.task, delta)
	if (!next) return
	retarget(next.pack, next.task)

	if (entry.kind === 'result') {
		entry.recheck = { targets: [next], whole: false, scope: null }
		await check([next], { into: entry })
	}
}

// ── экраны ─────────────────────────────────────────────────────────────

/** Пункт меню: название читаемым цветом, пояснение приглушённо. */
const item = (label, about, action, extra = {}) => ({
	label: palette.ink(padEnd(label, 22)) + (about ? palette.surface(about) : ''),
	search: label + ' ' + (about ?? ''),
	action,
	...extra,
})

/** Короткая сводка по задаче для правой колонки. */
function taskSummary(pack, task) {
	const entry = entryOf(progress, task.id)
	if (isTaskStale(progress, task.id, fileOf(pack, task))) return palette.amber('перепроверить')
	if (!entry) return palette.surface('не проверялась')
	if (entry.status === 'pass') return palette.mint('сдана')
	if (entry.total > 0) return palette.amber(`${entry.passed}/${entry.total}`)
	return palette.rose('не сдана')
}

/** Есть ли у задачи пошаговый разбор. */
const hasWalkthrough = (pack, task) => loadWalkthroughs(pack).has(task.id)

function mainScreen() {
	const target = focused()
	const label = target
		? palette.surface('◂ ') +
			c.bold(palette.accent(target.task.id)) +
			palette.ink('  ' + target.task.title) +
			palette.surface(' ▸')
		: palette.mint('всё решено')
	const need = fn => () => (target ? fn(target.pack, target.task) : undefined)

	return {
		title: null,
		hint: target
			? `${target.pack.code} · ${target.pack.title}   ${strip(stateLine(progress, target.pack, target.task))}`
			: '',
		swap: { label: 'другая задача' },
		items: [
			{
				label: palette.ink(padEnd('Решать', 22)) + label,
				search: 'решать открыть задачу',
				action: need(openTask),
			},
			item('Условие и приёмка', 'что сделать и какие проверки', need(openCard)),
			item(
				'Проверить',
				'тесты и типы этой задачи',
				need((pack, task) => check([{ pack, task }])),
			),
			item('Разбор решения', 'по шагам на живом примере', need(openWalk)),
			{ separator: true, label: 'навигация' },
			item('Паки и задачи', 'выбрать руками', () => push('packs', packsScreen)),
			item('Проверить всё', 'все тесты и типы, ~10 секунд', () =>
				check(allTasks(packs), { whole: true }),
			),
			item('Прогресс', 'таблица + PROGRESS.md', () => runInConsole('yarn progress')),
			{ separator: true, label: 'служебное' },
			item('Сбросить решения', 'вернуть заготовки', () => push('clean', cleanScreen)),
			item('Инструменты', 'сырой vitest, типы, линт', () => push('checks', checksScreen)),
			item('Внешний вид', 'темы и цвета', () => push('appearance', appearanceScreen)),
			item('Все команды', 'шпаргалка по yarn', () => push('help', helpScreen)),
			{ label: palette.surface('Выход'), search: 'выход', action: () => quit() },
		],
	}
}

function packsScreen() {
	let currentLevel = null
	const items = []

	for (const pack of packs) {
		if (pack.level !== currentLevel) {
			currentLevel = pack.level
			items.push({ separator: true, label: `уровень ${currentLevel}` })
		}

		const total = pack.tasks.size
		const done = [...pack.tasks.keys()].filter(id => statusOf(progress, id) === 'pass').length

		items.push({
			label: palette.accent(padEnd(pack.code, 6)) + palette.ink(cell(pack.title, 24)),
			search: `${pack.code} ${pack.title} ${pack.subtitle}`,
			right: bar(done, total, 12) + ' ' + palette.faint(padEnd(`${done}/${total}`, 6)),
			action: () => push('tasks', tasksScreen, { pack }),
		})
	}

	return { title: 'ПАКИ', hint: '● сдано   ◐ частично   ○ нет', filterable: true, items }
}

function tasksScreen(entry) {
	const { pack } = entry
	const tasks = [...pack.tasks.values()]

	const items = [
		item('Проверить весь пак', `${tasks.length} задач`, () =>
			check(
				tasks.map(task => ({ pack, task })),
				{ scope: pack },
			),
		),
		{ separator: true, label: 'задачи' },
		...tasks.map(task => ({
			label:
				(isTaskStale(progress, task.id, fileOf(pack, task))
					? palette.amber('⟳')
					: mark(statusOf(progress, task.id))) +
				'  ' +
				palette.accent(padEnd(task.id, 9)) +
				starsCell(task.stars) +
				palette.ink(cell(task.title, 32)),
			search: `${task.id} ${task.title}`,
			right: taskSummary(pack, task),
			taskId: task.id,
			action: () => push('task', taskScreen, { pack, task }),
		})),
	]

	return {
		title: `${pack.code} · ${pack.title}`,
		hint: `${pack.subtitle}  ·  норматив ~${pack.norm} мин`,
		filterable: true,
		swap: { label: 'другой пак' },
		items,
	}
}

function taskScreen(entry) {
	const { pack, task } = entry
	const file = relativePath(fileOf(pack, task))
	const walk = hasWalkthrough(pack, task)

	return {
		title: `${task.id} · ${task.title}   ${stars(task.stars)}`,
		hint: `${strip(stateLine(progress, pack, task))}  ·  ${file}`,
		swap: { label: 'соседняя задача' },
		items: [
			item('Решать', 'открыть в VS Code', () => openTask(pack, task)),
			item('Условие и приёмка', 'что сделать и какие проверки', () => openCard(pack, task)),
			item('Проверить', 'тесты и типы', () => check([{ pack, task }])),
			{ separator: true, label: 'разбор' },
			{
				label:
					palette.ink(padEnd('Разбор решения', 22)) +
					(walk
						? palette.surface('по шагам · после своей попытки')
						: palette.surface('пока только эталон и заметка')),
				search: 'разбор решения',
				action: () => openWalk(pack, task),
			},
			item('Карточка в буфер', 'вставить в claude.ai', () => {
				message = runQuiet('task.mjs', [task.id, '-c'])
					? palette.mint('✓ ') + palette.ink('карточка в буфере обмена')
					: palette.rose('✗ скопировать не удалось')
			}),
			{ separator: true, label: 'служебное' },
			item('Watch', 'тесты в консоли, Ctrl+C — стоп', () => runInConsole(`yarn watch ${task.id}`)),
			{
				label: palette.amber(padEnd('Сбросить задачу', 22)) + palette.surface('вернуть заготовку'),
				search: 'сбросить',
				action: () => {
					message = runQuiet('clean.mjs', [task.id, '-y'])
						? palette.mint('✓ ') + palette.ink(`${task.id} сброшена к заготовке`)
						: palette.rose('✗ сбросить не удалось')
				},
			},
			{ label: palette.surface('Назад'), search: 'назад', action: () => back() },
		],
	}
}

function openCard(pack, task) {
	pickTask(task)
	push('card', cardScreen, { pack, task })
}

function cardScreen(entry) {
	const { pack, task } = entry
	return {
		doc: renderCard({ pack, task, progress }),
		hint: `${task.id} · условие`,
		swap: { label: 'соседняя задача' },
		enter: { label: 'решать', run: () => openTask(pack, task) },
	}
}

function openWalk(pack, task) {
	pickTask(task)
	push('walk', walkScreen, { pack, task })
}

function walkScreen(entry) {
	const { pack, task } = entry
	return {
		doc: renderWalkthrough({
			pack,
			task,
			entry: loadWalkthroughs(pack).get(task.id),
			width: width(),
		}),
		hint: `${task.id} · разбор`,
		swap: { label: 'соседняя задача' },
		enter: { label: 'решать', run: () => openTask(pack, task) },
	}
}

function resultScreen(entry) {
	const { recheck } = entry
	return {
		doc: entry.lines,
		hint: entry.task ? `${entry.task.id} · проверка` : 'проверка',
		swap: entry.task ? { label: 'проверить соседнюю' } : null,
		enter: {
			label: 'перепроверить',
			run: () =>
				check(recheck.targets, { whole: recheck.whole, scope: recheck.scope, into: entry }),
		},
	}
}

/**
 * Подтверждение сброса прямо в меню. Консоль не умеет отвечать на вопросы
 * команды, поэтому вопрос задаётся здесь, а в консоль уходит команда с `-y`.
 */
function confirmClean(label, args) {
	push('confirm', () => ({
		title: `СБРОСИТЬ: ${label}`,
		hint: 'решения сотрутся, файлы вернутся к заготовкам',
		items: [
			{
				label: palette.rose(padEnd('Да, сбросить', 22)) + palette.surface(label),
				search: 'да сбросить',
				action: () => {
					back()
					runInConsole(`yarn clean ${args} -y`)
				},
			},
			{ label: palette.surface('Отмена'), search: 'отмена', action: () => back() },
		],
	}))
}

function cleanScreen() {
	const levels = [...new Set(packs.map(pack => pack.level))].sort()

	return {
		title: 'СБРОС РЕШЕНИЙ',
		hint: 'возвращает файлы к заготовкам — решения стираются',
		items: [
			item('Показать, что тронуто', 'ничего не меняет', () => runInConsole('yarn clean')),
			item('Выбрать пак', '', () =>
				push('clean-pack', () => ({
					title: 'СБРОСИТЬ ПАК',
					hint: 'подтверждение спросят перед удалением',
					filterable: true,
					items: packs.map(pack => ({
						label: palette.accent(padEnd(pack.code, 6)) + palette.ink(pack.title),
						search: `${pack.code} ${pack.title}`,
						action: () => confirmClean(`пак ${pack.code}`, pack.code),
					})),
				})),
			),
			item('Выбрать уровень', '', () =>
				push('clean-level', () => ({
					title: 'СБРОСИТЬ УРОВЕНЬ',
					items: levels.map(level => ({
						label:
							palette.accent(padEnd(`уровень ${level}`, 14)) +
							palette.surface(`${packs.filter(pack => pack.level === level).length} паков`),
						action: () => confirmClean(`уровень ${level}`, `--level ${level}`),
					})),
				})),
			),
			item('Только зачтённые задачи', '', () => confirmClean('все зачтённые', '--done')),
			{
				label: palette.rose('Сбросить весь тренажёр'),
				search: 'сбросить всё',
				action: () => confirmClean('весь тренажёр', '--all'),
			},
			{
				label: palette.surface('Пересобрать эталоны (stubs.json)'),
				search: 'stubs снапшот',
				action: () => runInConsole('yarn clean --snapshot'),
			},
			{ label: palette.surface('Назад'), search: 'назад', action: () => back() },
		],
	}
}

function checksScreen() {
	return {
		title: 'ИНСТРУМЕНТЫ',
		hint: 'вывод идёт в консоль внизу, Ctrl+C там останавливает',
		items: [
			item('Тесты один раз', 'yarn test', () => runInConsole('yarn test')),
			item('Тесты в watch', 'yarn t', () => runInConsole('yarn t')),
			item('Типы', 'yarn typecheck', () => runInConsole('yarn typecheck')),
			item('Тренажёр цел', 'yarn verify: эталоны, разборы, типы', () =>
				runInConsole('yarn verify'),
			),
			item('Линт', 'yarn lint', () => runInConsole('yarn lint')),
			{ label: palette.surface('Назад'), search: 'назад', action: () => back() },
		],
	}
}

/**
 * Подключить или отключить тренажёр в профиле PowerShell. Спрашивать PowerShell
 * про путь к профилю — около секунды, поэтому клавиши на это время молчат.
 */
async function toggleShell(id) {
	busy = true
	message = palette.faint('… PowerShell')
	render()
	try {
		const files = id === 'on' ? await installShell() : await uninstallShell()
		message =
			files.length === 0
				? palette.amber('PowerShell не найден — подключать некуда')
				: id === 'on'
					? palette.mint('✓ ') + palette.ink('подключено — сработает в новом окне терминала')
					: palette.mint('✓ ') + palette.ink('отключено и больше не подключится само')
	} finally {
		busy = false
	}
}

/**
 * Настройки оформления. ◂ ▸ меняют значение прямо в списке, экран
 * перерисовывается сразу. Выбор пишется в `.ui.json` мгновенно.
 */
function appearanceScreen() {
	function choice(label, about, values, currentId, apply) {
		const index = Math.max(
			0,
			values.findIndex(entry => entry.id === currentId),
		)
		const move = step => async () => {
			await apply(values[(index + step + values.length) % values.length].id)
			saveUi()
			forgetFrame()
		}

		return {
			label:
				palette.ink(padEnd(label, 18)) +
				palette.surface('◂ ') +
				c.bold(palette.accent(cell(values[index].label, 14))) +
				palette.surface('▸  ') +
				palette.faint(about),
			search: `${label} ${values[index].label}`,
			onLeft: move(-1),
			onRight: move(1),
			action: move(1),
		}
	}

	const theme = findTheme(ui.theme)
	const swatch = ['accent', 'sky', 'mint', 'amber', 'rose', 'violet']
		.map(name => palette[name]('██'))
		.join(' ')

	const preview = [
		row(
			GUTTER.top,
			c.bold(palette.accent('ЗАГОЛОВОК')) + palette.surface('  ·  ') + palette.faint('пояснение'),
		),
		line(palette.ink('основной текст') + palette.surface('   второстепенный')),
		line(
			mark('pass') +
				' сдано  ' +
				mark('partial') +
				' частично  ' +
				mark('fail') +
				' нет   ' +
				stars('★☆☆') +
				' ' +
				stars('★★☆') +
				' ' +
				stars('★★★'),
		),
		line(bar(7, 12, 22) + '  ' + c.bold(palette.ink('7/12')) + palette.faint('  58%')),
		line(key('yarn ok') + palette.faint('  плашка команды') + '   ' + swatch),
		line(
			c.bold(palette.mint('СДАНА')) +
				'   ' +
				c.bold(palette.amber('ПОЧТИ')) +
				'   ' +
				c.bold(palette.rose('НЕ СДАНА')),
		),
	]

	return {
		title: 'ВНЕШНИЙ ВИД',
		hint: `${theme.label} — ${theme.about}`,
		items: [
			choice('Тема', 'палитра целиком', THEMES, ui.theme, id => applyUi({ theme: id })),
			choice('Контраст', 'яркость тусклого текста', CONTRAST, ui.contrast, id =>
				applyUi({ contrast: id }),
			),
			choice('Полоса', 'символы прогресса', BARS, ui.bar, id => applyUi({ bar: id })),
			choice(
				'Подложка',
				'залить фон — для прозрачных терминалов',
				[
					{ id: 'on', label: 'вкл' },
					{ id: 'off', label: 'выкл' },
				],
				ui.panel ? 'on' : 'off',
				id => applyUi({ panel: id === 'on' }),
			),
			choice(
				'PowerShell',
				'шпаргалка при входе в папку и Tab',
				[
					{ id: 'on', label: 'вкл' },
					{ id: 'off', label: 'выкл' },
				],
				ui.shell === false ? 'off' : 'on',
				toggleShell,
			),
			{ separator: true, label: 'как это выглядит' },
			...preview.map(entry => ({ separator: true, raw: true, label: entry })),
			{ separator: true, label: ' ' },
			{
				label: palette.surface('Вернуть стандартные настройки'),
				search: 'сброс настроек',
				action: () => {
					applyUi(DEFAULT_UI)
					saveUi()
					forgetFrame()
				},
			},
			{ label: palette.surface('Назад'), search: 'назад', action: () => back() },
		],
	}
}

function helpScreen() {
	const groups = [
		[
			'основное',
			[
				['yarn menu', 'это меню'],
				['yarn go', 'открыть следующую нерешённую'],
				['yarn ok', 'проверить текущую задачу'],
				['yarn how', 'разбор решения текущей задачи'],
			],
		],
		[
			'с аргументом',
			[
				['yarn go BAS-07', 'открыть конкретную задачу'],
				['yarn go BAS', 'первая нерешённая в паке'],
				['yarn ok BAS-07', 'проверить конкретную'],
				['yarn ok BAS', 'проверить весь пак'],
				['yarn ok --all', 'проверить весь тренажёр'],
				['yarn how BAS-07', 'разбор конкретной задачи'],
			],
		],
		[
			'смотреть',
			[
				['yarn task', 'список паков'],
				['yarn task BAS', 'список задач пака'],
				['yarn task BAS-07 -c', 'карточка задачи в буфер'],
				['yarn progress', 'полный прогон и таблица'],
				['yarn watch', 'держать тесты текущей задачи запущенными'],
			],
		],
		[
			'сбрасывать',
			[
				['yarn clean', 'что тронуто относительно заготовок'],
				['yarn clean BAS-07', 'сбросить одну задачу'],
				['yarn clean BAS', 'сбросить пак'],
				['yarn clean --all', 'сбросить всё'],
			],
		],
		[
			'инструменты',
			[
				['yarn test', 'сырой прогон vitest'],
				['yarn typecheck', 'проверка типов всего проекта'],
				['yarn verify', 'тренажёр цел: эталоны, разборы, типы'],
				['yarn lint', 'eslint'],
				['yarn format', 'prettier по репозиторию'],
			],
		],
	]

	const pad = Math.max(...groups.flatMap(([, rows]) => rows).map(([command]) => command.length)) + 3

	const items = []
	for (const [group, commands] of groups) {
		items.push({ separator: true, label: group })
		for (const [command, about] of commands) {
			items.push({
				label: palette.accent(padEnd(command, pad)) + palette.surface(about),
				search: `${command} ${about}`,
				action: () => {
					copy(command)
					message = palette.mint('✓ скопировано: ') + palette.faint(command)
				},
			})
		}
	}

	return {
		title: 'ВСЕ КОМАНДЫ',
		hint: 'Enter копирует команду в буфер обмена',
		filterable: true,
		items,
	}
}

/** Буфер обмена. Без shell: clip, pbcopy и xclip — обычные исполняемые файлы. */
function copy(text) {
	const command =
		process.platform === 'win32' ? 'clip' : process.platform === 'darwin' ? 'pbcopy' : 'xclip'
	const args = process.platform === 'linux' ? ['-selection', 'clipboard'] : []
	try {
		spawnSync(command, args, { input: text })
	} catch {
		/* буфера нет — не страшно */
	}
}

// ── управление ─────────────────────────────────────────────────────────

function quit() {
	con.kill()
	restoreTerminal()
	console.log('')
	console.log(row(GUTTER.end, palette.faint('вернуться: ') + palette.accent('yarn menu')))
	console.log('')
	process.exit(0)
}

/**
 * Шаг курсора, разделители пропускаются. Без перескока с конца в начало:
 * внизу списка лежит консоль, и ↓ с последнего пункта ведёт в неё.
 * Возвращает false, если сдвинуться некуда.
 */
function step(direction) {
	const items = visibleItems(active())
	let next = selected + direction
	while (next >= 0 && next < items.length && items[next].separator) next += direction
	if (next < 0 || next >= items.length) return false
	selected = next
	return true
}

/** Прокрутка документа. Границы выставит renderDoc. */
function scroll(delta) {
	top().scroll = (top().scroll ?? 0) + delta
}

/** Ввод в строку поиска. Возвращает true, если клавиша израсходована. */
function typeFilter(char, pressed) {
	if (!filtering) return false
	if (pressed.name === 'return' || pressed.name === 'tab') {
		filtering = false
		return true
	}
	if (pressed.name === 'escape') {
		filter = ''
		filtering = false
		return true
	}
	if (pressed.name === 'backspace') filter = filter.slice(0, -1)
	else if (char && !pressed.ctrl && !pressed.meta && char.length === 1 && char >= ' ')
		filter += char
	else return false

	selected = firstSelectable(visibleItems(active()))
	return true
}

async function handleKey(char, pressed) {
	if (!pressed || busy) return

	// Фокус в консоли: печатаемое идёт в строку ввода, ↑ и Esc на пустой строке — обратно в меню.
	if (focus === 'console') {
		if (con.handleKey(char, pressed, width()) === 'menu') focus = 'menu'
		message = ''
		return render()
	}

	// Tab — короткий путь в консоль из любого места меню.
	if (pressed.name === 'tab' && !filtering) {
		focus = 'console'
		return render()
	}

	if (pressed.ctrl && pressed.name === 'c') {
		if (stack.length === 1 && !filter && !filtering) return quit()
		back()
		return render()
	}

	if (typeFilter(char, pressed)) return render()

	const screen = active()

	if (char === '/' && screen.filterable) {
		filtering = true
		message = ''
		return render()
	}

	// ◂ ▸ никогда не закрывают меню: значение настройки, иначе соседняя задача или пак.
	if (pressed.name === 'left' || pressed.name === 'right') {
		const delta = pressed.name === 'left' ? -1 : 1
		const focusedItem = screen.doc ? null : visibleItems(screen)[selected]
		message = ''
		if (focusedItem?.onLeft) await (delta < 0 ? focusedItem.onLeft() : focusedItem.onRight())
		else if (screen.swap) await swap(delta)
		return render()
	}

	if (screen.doc) {
		const page = top().page ?? 10
		switch (pressed.name) {
			case 'up':
			case 'k':
				scroll(-1)
				break
			case 'down':
				// Долистал до конца — следующий ↓ уводит в консоль.
				if ((top().scroll ?? 0) >= (top().maxScroll ?? 0)) focus = 'console'
				else scroll(1)
				break
			case 'j':
				scroll(1)
				break
			case 'pageup':
				scroll(-page)
				break
			case 'pagedown':
			case 'space':
				scroll(page)
				break
			case 'home':
				top().scroll = 0
				break
			case 'end':
				top().scroll = Number.MAX_SAFE_INTEGER
				break
			case 'return':
				message = ''
				if (screen.enter) await screen.enter.run()
				break
			case 'escape':
			case 'backspace':
				back()
				break
			case 'q':
				return quit()
			default:
				return
		}
		return render()
	}

	switch (pressed.name) {
		case 'up':
		case 'k':
			step(-1)
			break
		case 'down':
			// С последнего пункта ↓ уводит в консоль.
			if (!step(1)) focus = 'console'
			break
		case 'j':
			step(1)
			break
		case 'pageup':
			for (let index = 0; index < 8; index += 1) step(-1)
			break
		case 'pagedown':
			for (let index = 0; index < 8; index += 1) step(1)
			break
		case 'return':
		case 'space': {
			const entry = visibleItems(screen)[selected]
			if (!entry || entry.separator) break
			message = ''
			await entry.action()
			break
		}
		case 'escape':
		case 'backspace':
			back()
			break
		case 'q':
			return quit()
		case 'home':
			selected = firstSelectable(visibleItems(screen))
			break
		case 'end': {
			const items = visibleItems(screen)
			selected = items.length - 1
			if (items[selected]?.separator) step(-1)
			break
		}
		default:
			return
	}
	render()
}

// ── запуск ─────────────────────────────────────────────────────────────

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', (char, pressed) => {
	handleKey(char, pressed).catch(reportError)
})

// В raw-режиме Ctrl+C приходит клавишей, сигнал бывает только снаружи — тогда выходим чисто.
process.on('SIGINT', () => quit())

// Пока команда в консоли работает, крутилка в её заголовке должна идти.
setInterval(() => {
	if (con.running) scheduleRender()
}, 100).unref()

// Необработанная ошибка вне обработчика клавиш — последний рубеж: терминал обязан
// остаться рабочим, а причина — в логе.
process.on('uncaughtException', crash)
process.on('unhandledRejection', crash)
process.on('exit', () => {
	con.kill()
	try {
		process.stdout.write(SHOW + ALT_OFF)
	} catch {
		/* поток закрыт */
	}
})

process.stdout.on('resize', () => {
	forgetFrame()
	try {
		render()
	} catch (error) {
		reportError(error)
	}
})

process.stdout.write(ALT_ON)
push('main', mainScreen)
render()

// Шпаргалка и Tab — часть приложения: при первом запуске подключаются сами,
// уже после отрисовки, чтобы меню не ждало PowerShell.
ensureShell()
	.then(done => {
		if (!done) return
		message =
			palette.mint('✓ ') + palette.ink('шпаргалка и Tab подключены к PowerShell — в новом окне')
		scheduleRender()
	})
	.catch(logError)
