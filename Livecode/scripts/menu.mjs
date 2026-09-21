#!/usr/bin/env node
/**
 * Интерактивное меню тренажёра: стрелки ↑↓, Enter — выбрать, Esc — назад, q — выход.
 *
 *   yarn menu
 *
 * Внешних зависимостей нет: raw-режим stdin плюс keypress из readline.
 * Любая команда запускается дочерним процессом с обычным stdio,
 * поэтому vitest в watch-режиме работает как при прямом запуске.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'
import {
	bar,
	c,
	loadPacks,
	padEnd,
	palette,
	percentOf,
	readProgress,
	ROOT,
	visibleWidth,
} from './lib.mjs'
import { isStale } from './state.mjs'
import { GUTTER, key, line, mark, row, stars } from './ui.mjs'

const CLEAR = '\x1b[2J\x1b[3J\x1b[H'
const HIDE = '\x1b[?25l'
const SHOW = '\x1b[?25h'

if (!process.stdin.isTTY) {
	console.log(c.yellow('Меню работает только в интерактивном терминале.'))
	console.log(c.gray('Запусти из обычной консоли: yarn menu'))
	process.exit(1)
}

let packs = loadPacks()
let progress = readProgress()

const stack = []
let selected = 0
let message = ''

// ── примитивы оформления ───────────────────────────────────────────────

const width = () => Math.max(48, Math.min(76, (process.stdout.columns ?? 80) - 6))

/** Отметка задачи по её текущему состоянию в прогрессе. */
const taskMark = id => mark(progress?.tasks?.[id])

// ── отрисовка ──────────────────────────────────────────────────────────

function header() {
	const total = packs.reduce((sum, pack) => sum + pack.tasks.size, 0)
	const done = Object.values(progress?.tasks ?? {}).filter(state => state === 'pass').length
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

	if (progress) {
		const counter = c.bold(palette.ink(String(done))) + palette.faint(`/${total}`)
		const tail = percent === 100 ? palette.mint('всё сдано') : palette.faint(`${percent}%`)
		out.push(line(bar(done, total, 30) + '  ' + counter + '  ' + tail))
		if (isStale(packs)) {
			out.push(
				line(palette.amber('⟳ ') + palette.faint('прогресс устарел — файлы правились позже')),
			)
		}
	} else {
		out.push(line(palette.faint('прогресс ещё не считался — пункт «Прогресс»')))
	}

	return out
}

/** Список с окном прокрутки: длинные паки не должны выезжать за экран. */
function renderList(items, cursor, height) {
	const visible = Math.max(5, Math.min(height, items.length))
	let start = 0
	if (items.length > visible) {
		start = Math.min(Math.max(0, cursor - Math.floor(visible / 2)), items.length - visible)
	}

	const inner = width()
	const out = []
	if (start > 0) out.push(line(palette.surface(`↑ ещё ${start}`)))

	for (let index = start; index < start + visible && index < items.length; index += 1) {
		const entry = items[index]

		if (entry.separator) {
			out.push(line(palette.surface(entry.label)))
			continue
		}

		const body = entry.right
			? padEnd(entry.label, inner - visibleWidth(entry.right) - 3) + '  ' + entry.right
			: entry.label

		if (index === cursor) {
			// Подложка на всю ширину строки — курсор видно боковым зрением.
			out.push(
				'  ' +
					palette.accent('▌') +
					palette.accent('▸') +
					palette.surface(' ' + padEnd(body, inner - 1), { bg: true }),
			)
		} else {
			out.push('  ' + palette.faint(GUTTER.line) + '  ' + body)
		}
	}

	const rest = items.length - (start + visible)
	if (rest > 0) out.push(line(palette.surface(`↓ ещё ${rest}`)))

	return out
}

function footer(screen) {
	const keys = [key('↑↓') + palette.faint(' выбор'), key('⏎') + palette.faint(' открыть')]
	if (stack.length > 1) keys.push(key('esc') + palette.faint(' назад'))
	keys.push(key('q') + palette.faint(' выход'))

	const out = [line()]
	if (screen.hint) out.push(line(palette.surface(screen.hint)))
	out.push('  ' + palette.faint(GUTTER.end) + '  ' + keys.join('   '))
	return out
}

function render() {
	const screen = stack[stack.length - 1]

	const out = [...header()]
	out.push(line())
	if (screen.title) {
		out.push(row(GUTTER.node, c.bold(palette.ink(screen.title))))
		out.push(line())
	}

	const used = out.length + 5
	const height = Math.max(5, (process.stdout.rows ?? 24) - used - 2)
	out.push(...renderList(screen.items, selected, height))
	out.push(...footer(screen))

	if (message) out.push('  ' + message)
	out.push('')

	process.stdout.write(CLEAR + HIDE + out.join('\n'))
}

// ── запуск внешних команд ──────────────────────────────────────────────

/**
 * Пока крутится дочерний процесс или ждём клавишу, обработчик меню молчит —
 * иначе стрелки в выводе команды двигали бы курсор невидимого списка.
 */
let busy = false

function waitForKey() {
	return new Promise(resolve => {
		const onKey = (_char, pressed) => {
			process.stdin.off('keypress', onKey)
			if (pressed?.ctrl && pressed.name === 'c') quit()
			resolve()
		}
		process.stdin.on('keypress', onKey)
	})
}

/** Отдать терминал дочернему процессу и забрать обратно. */
async function run(args, { pause = false } = {}) {
	busy = true
	process.stdin.setRawMode(false)
	process.stdout.write(SHOW + CLEAR)

	spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' })

	process.stdin.setRawMode(true)
	process.stdin.resume()

	if (pause) {
		process.stdout.write('\n  ' + key('любая клавиша') + palette.faint(' — назад в меню '))
		await waitForKey()
	}

	// Файлы могли измениться: задача решена, пак сброшен, прогресс пересчитан.
	packs = loadPacks()
	progress = readProgress()
	busy = false
}

const runScript = (name, extra = []) =>
	run([path.join(ROOT, 'scripts', name), ...extra], { pause: true })

// ── навигация по экранам ───────────────────────────────────────────────

/** Первый пункт, на который можно встать: разделители пропускаем. */
function firstSelectable(screen) {
	const index = screen.items.findIndex(entry => !entry.separator)
	return index === -1 ? 0 : index
}

function push(screen) {
	// Запоминаем, где стояли: при возврате список откроется на том же месте.
	if (stack.length > 0) stack[stack.length - 1].cursor = selected
	stack.push(screen)
	selected = firstSelectable(screen)
	message = ''
}

function back() {
	if (stack.length > 1) {
		stack.pop()
		const screen = stack[stack.length - 1]
		selected = screen.cursor ?? firstSelectable(screen)
		message = ''
	}
}

// ── экраны ─────────────────────────────────────────────────────────────

/** Пункт меню: название читаемым цветом, пояснение приглушённо. */
const item = (label, about, action) => ({
	label: palette.ink(label) + (about ? palette.surface('  ' + about) : ''),
	action,
})

function mainScreen() {
	return {
		title: null,
		hint: 'нерешённая ищется сама — от лёгких паков к сложным',
		items: [
			item('Решать дальше', 'первая нерешённая задача', () => runScript('solve.mjs')),
			item('Выбрать пак и задачу', '', () => push(packsScreen())),
			item('Прогресс', 'прогнать всё и показать таблицу', () => runScript('progress.mjs')),
			item('Сбросить решения', '', () => push(cleanScreen())),
			item('Проверки', 'тесты, типы, линт', () => push(checksScreen())),
			item('Все команды', 'шпаргалка по yarn', () => push(helpScreen())),
			{ label: palette.surface('Выход'), action: () => quit() },
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
		const done = [...pack.tasks.keys()].filter(id => progress?.tasks?.[id] === 'pass').length

		items.push({
			label: palette.accent(padEnd(pack.code, 6)) + palette.ink(padEnd(pack.title, 25)),
			right: bar(done, total, 12) + ' ' + palette.faint(padEnd(`${done}/${total}`, 6)),
			action: () => push(tasksScreen(pack)),
		})
	}

	return { title: 'ПАКИ', hint: '● сдано   ◐ частично   ○ нет', items }
}

function tasksScreen(pack) {
	const items = [...pack.tasks.values()].map(task => ({
		label:
			taskMark(task.id) +
			'  ' +
			palette.accent(padEnd(task.id, 9)) +
			stars(task.stars) +
			padEnd('', 5 - (task.stars?.length ?? 0)) +
			palette.ink(task.title),
		action: () => push(taskScreen(pack, task)),
	}))

	return {
		title: `${pack.code} · ${pack.title}`,
		hint: `${pack.subtitle}  ·  норматив ~${pack.norm} мин`,
		items,
	}
}

function taskScreen(pack, task) {
	const file = path
		.relative(ROOT, task.file ?? pack.tasksFile)
		.split(path.sep)
		.join('/')

	return {
		title: `${task.id} · ${task.title}  ${stars(task.stars)}`,
		hint: file,
		items: [
			item('Решать', 'открыть в редакторе и гонять её тесты', () =>
				runScript('solve.mjs', [task.id]),
			),
			item('Карточка в буфер', 'вставить в claude.ai', () =>
				runScript('task.mjs', [task.id, '-c']),
			),
			item('Показать условие и тесты', '', () => runScript('task.mjs', [task.id])),
			{
				label: palette.ink('Эталонное решение') + palette.rose('  только после своей попытки'),
				action: () => runScript('task.mjs', [task.id, '-s']),
			},
			{
				label: palette.amber('Сбросить эту задачу'),
				action: () => runScript('clean.mjs', [task.id, '-y']),
			},
			{ label: palette.surface('Назад'), action: () => back() },
		],
	}
}

function cleanScreen() {
	const levels = [...new Set(packs.map(pack => pack.level))].sort()

	return {
		title: 'СБРОС РЕШЕНИЙ',
		hint: 'возвращает файлы к заготовкам — решения стираются',
		items: [
			item('Показать, что тронуто', 'ничего не меняет', () => runScript('clean.mjs')),
			item('Выбрать пак', '', () =>
				push({
					title: 'СБРОСИТЬ ПАК',
					hint: 'подтверждение спросят перед удалением',
					items: packs.map(pack => ({
						label: palette.accent(padEnd(pack.code, 6)) + palette.ink(pack.title),
						action: () => runScript('clean.mjs', [pack.code]),
					})),
				}),
			),
			item('Выбрать уровень', '', () =>
				push({
					title: 'СБРОСИТЬ УРОВЕНЬ',
					items: levels.map(level => ({
						label:
							palette.accent(padEnd(`уровень ${level}`, 14)) +
							palette.surface(`${packs.filter(pack => pack.level === level).length} паков`),
						action: () => runScript('clean.mjs', ['--level', String(level)]),
					})),
				}),
			),
			item('Только зачтённые задачи', '', () => runScript('clean.mjs', ['--done'])),
			{
				label: palette.rose('Сбросить весь тренажёр'),
				action: () => runScript('clean.mjs', ['--all']),
			},
			{
				label: palette.surface('Пересобрать эталоны (stubs.json)'),
				action: () => runScript('clean.mjs', ['--snapshot']),
			},
			{ label: palette.surface('Назад'), action: () => back() },
		],
	}
}

function checksScreen() {
	const bin = (...parts) => path.join(ROOT, 'node_modules', ...parts)

	return {
		title: 'ПРОВЕРКИ',
		hint: 'запускается отдельной командой, Ctrl+C возвращает сюда',
		items: [
			item('Тесты один раз', 'yarn test', () =>
				run([bin('vitest', 'vitest.mjs'), 'run'], { pause: true }),
			),
			item('Тесты в watch', 'yarn t', () =>
				run([bin('vitest', 'vitest.mjs'), '--hideSkippedTests']),
			),
			item('Типы', 'yarn typecheck', () =>
				run([bin('typescript', 'bin', 'tsc'), '-p', 'tsconfig.app.json'], { pause: true }),
			),
			item('Эталоны целы', 'yarn verify', () => runScript('verify-types.mjs')),
			item('Линт', 'yarn lint', () =>
				run([bin('eslint', 'bin', 'eslint.js'), '.'], { pause: true }),
			),
			{ label: palette.surface('Назад'), action: () => back() },
		],
	}
}

function helpScreen() {
	const groups = [
		[
			'решать',
			[
				['yarn menu', 'это меню'],
				['yarn solve', 'первая нерешённая задача'],
				['yarn solve BAS-07', 'конкретная задача'],
				['yarn solve BAS', 'первая нерешённая в паке'],
			],
		],
		[
			'смотреть',
			[
				['yarn task', 'список паков'],
				['yarn task BAS', 'список задач пака'],
				['yarn task BAS-07 -c', 'карточка задачи в буфер'],
				['yarn task BAS-07 -s', 'карточка вместе с эталоном'],
				['yarn progress', 'прогнать всё и показать таблицу'],
				['yarn progress BAS', 'то же с разбивкой по задачам'],
			],
		],
		[
			'сбрасывать',
			[
				['yarn clean', 'что тронуто относительно заготовок'],
				['yarn clean BAS-07', 'сбросить одну задачу'],
				['yarn clean BAS', 'сбросить пак'],
				['yarn clean --level 1', 'сбросить все паки уровня'],
				['yarn clean --done', 'сбросить только зачтённые'],
				['yarn clean --all', 'сбросить всё'],
			],
		],
		[
			'проверять',
			[
				['yarn t', 'тесты в watch'],
				['yarn test', 'тесты один раз'],
				['yarn typecheck', 'проверка типов'],
				['yarn verify', 'эталоны и типы целы'],
				['yarn lint', 'eslint'],
				['yarn format', 'прогнать prettier по репозиторию'],
			],
		],
	]

	const pad = Math.max(...groups.flatMap(([, rows]) => rows).map(([command]) => command.length)) + 3

	const items = []
	for (const [group, rows] of groups) {
		items.push({ separator: true, label: group })
		for (const [command, about] of rows) {
			items.push({
				label: palette.accent(padEnd(command, pad)) + palette.surface(about),
				action: () => {
					copy(command)
					message = palette.mint('✓ скопировано: ') + palette.faint(command)
				},
			})
		}
	}

	return { title: 'ВСЕ КОМАНДЫ', hint: 'Enter копирует команду в буфер обмена', items }
}

function copy(text) {
	const isWin = process.platform === 'win32'
	const command = isWin ? 'clip' : process.platform === 'darwin' ? 'pbcopy' : 'xclip'
	try {
		spawnSync(
			command,
			isWin ? [] : process.platform === 'linux' ? ['-selection', 'clipboard'] : [],
			{
				input: text,
				shell: isWin,
			},
		)
	} catch {
		/* буфера нет — не страшно */
	}
}

// ── управление ─────────────────────────────────────────────────────────

function quit() {
	process.stdout.write(SHOW + CLEAR)
	console.log('')
	console.log(row(GUTTER.end, palette.faint('вернуться: ') + palette.accent('yarn menu')))
	console.log('')
	process.exit(0)
}

/** Пропускаем разделители — на них нельзя встать курсором. */
function step(direction) {
	const items = stack[stack.length - 1].items
	let next = selected
	for (let guard = 0; guard < items.length; guard += 1) {
		next = (next + direction + items.length) % items.length
		if (!items[next].separator) break
	}
	selected = next
}

async function activate() {
	const current = stack[stack.length - 1].items[selected]
	if (!current || current.separator) return
	message = ''
	await current.action()
}

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', async (_char, pressed) => {
	if (!pressed || busy) return
	if (pressed.ctrl && pressed.name === 'c') return quit()

	switch (pressed.name) {
		case 'up':
		case 'k':
			step(-1)
			break
		case 'down':
		case 'j':
			step(1)
			break
		case 'return':
		case 'space':
			await activate()
			break
		case 'escape':
		case 'left':
		case 'backspace':
			back()
			break
		case 'q':
			return quit()
		case 'home':
			selected = firstSelectable(stack[stack.length - 1])
			break
		case 'end':
			selected = stack[stack.length - 1].items.length - 1
			break
		default:
			return
	}
	render()
})

process.on('exit', () => process.stdout.write(SHOW))
process.stdout.on('resize', () => !busy && render())

push(mainScreen())
render()
