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
import { bar, c, loadPacks, padEnd, readProgress, ROOT } from './lib.mjs'
import { isStale } from './state.mjs'

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

/** Стек экранов. Наверху — текущий. */
const stack = []
let selected = 0
let message = ''

// ── отрисовка ──────────────────────────────────────────────────────────

const RULE = '─'.repeat(72)

function header() {
	const total = packs.reduce((sum, pack) => sum + pack.tasks.size, 0)
	const done = Object.values(progress?.tasks ?? {}).filter(state => state === 'pass').length
	const stale = progress ? isStale(packs) : true

	const lines = []
	lines.push('')
	lines.push('  ' + c.bold(c.cyan('ТРЕНАЖЁР')) + c.gray('  ·  livecode drills'))
	lines.push(c.gray('  ' + RULE))
	if (progress) {
		lines.push(`  ${bar(done, total, 32)}  ${c.bold(`${done}/${total}`)} ${c.gray('задач сдано')}`)
		if (stale) lines.push(c.yellow('  прогресс устарел — файлы правились после последнего прогона'))
	} else {
		lines.push(c.gray('  прогресс ещё не считался — выбери пункт «Прогресс»'))
	}
	lines.push(c.gray('  ' + RULE))
	return lines
}

function footer(screen) {
	const hints = ['↑↓ выбор', 'Enter открыть']
	if (stack.length > 1) hints.push('Esc назад')
	hints.push('q выход')
	const lines = [c.gray('  ' + RULE), c.gray('  ' + hints.join('   ·   '))]
	if (screen.hint) lines.splice(1, 0, c.gray('  ' + screen.hint))
	return lines
}

/** Список с окном прокрутки: длинные паки не должны выезжать за экран. */
function renderList(items, cursor, height) {
	const window = Math.max(5, Math.min(height, items.length))
	let start = 0
	if (items.length > window) {
		start = Math.min(Math.max(0, cursor - Math.floor(window / 2)), items.length - window)
	}

	const lines = []
	if (start > 0) lines.push(c.gray('    ↑ ещё ' + start))

	for (let index = start; index < start + window && index < items.length; index += 1) {
		const item = items[index]
		const active = index === cursor
		const pointer = active ? c.cyan('▸ ') : '  '
		const label = active ? c.bold(item.label) : item.label
		const right = item.right ? '  ' + item.right : ''
		lines.push('  ' + pointer + label + right)
	}

	const rest = items.length - (start + window)
	if (rest > 0) lines.push(c.gray('    ↓ ещё ' + rest))
	return lines
}

function render() {
	const screen = stack[stack.length - 1]
	const items = screen.items

	const out = [...header()]
	if (screen.title) {
		out.push('  ' + c.bold(screen.title))
		out.push('')
	}

	const used = out.length + 4
	const height = Math.max(5, (process.stdout.rows ?? 24) - used - 3)
	out.push(...renderList(items, selected, height))
	out.push(...footer(screen))

	if (message) {
		out.push('')
		out.push('  ' + message)
	}

	process.stdout.write(CLEAR + HIDE + out.join('\n') + '\n')
}

// ── запуск внешних команд ──────────────────────────────────────────────

/**
 * Пока крутится дочерний процесс или ждём клавишу, обработчик меню молчит —
 * иначе стрелки в выводе команды двигали бы курсор невидимого списка.
 */
let busy = false

function waitForKey() {
	return new Promise(resolve => {
		const onKey = (_char, key) => {
			process.stdin.off('keypress', onKey)
			if (key?.ctrl && key.name === 'c') quit()
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
		process.stdout.write('\n' + c.gray('  любая клавиша — назад в меню '))
		await waitForKey()
	}

	// Файлы могли измениться: пак решён, задача сброшена, прогресс пересчитан.
	packs = loadPacks()
	progress = readProgress()
	busy = false
}

const script = name => [path.join(ROOT, 'scripts', name)]

function runYarn(scriptName, extra = []) {
	return run([...script(scriptName), ...extra], { pause: true })
}

// ── экраны ─────────────────────────────────────────────────────────────

/** Первый пункт, на который можно встать: разделители уровней пропускаем. */
function firstSelectable(screen) {
	const index = screen.items.findIndex(item => !item.separator)
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

function taskMark(id) {
	const state = progress?.tasks?.[id]
	if (state === 'pass') return c.green('✔')
	if (state === 'partial') return c.yellow('◐')
	if (state === 'fail') return c.red('✗')
	return c.gray('·')
}

function mainScreen() {
	return {
		title: null,
		hint: 'первая нерешённая ищется сама — по порядку от лёгких паков к сложным',
		items: [
			{
				label: 'Решать дальше' + c.gray('  — открыть первую нерешённую'),
				action: () => runYarn('solve.mjs'),
			},
			{
				label: 'Выбрать пак и задачу',
				action: () => push(packsScreen()),
			},
			{
				label: 'Прогресс' + c.gray('  — прогнать всё и показать таблицу'),
				action: () => runYarn('progress.mjs'),
			},
			{
				label: 'Сбросить решения',
				action: () => push(cleanScreen()),
			},
			{
				label: 'Проверки' + c.gray('  — тесты, типы, линт, формат'),
				action: () => push(checksScreen()),
			},
			{
				label: 'Все команды' + c.gray('  — шпаргалка по yarn'),
				action: () => push(helpScreen()),
			},
			{
				label: c.gray('Выход'),
				action: () => quit(),
			},
		],
	}
}

function packsScreen() {
	let currentLevel = null
	const items = []

	for (const pack of packs) {
		if (pack.level !== currentLevel) {
			currentLevel = pack.level
			items.push({ separator: true, label: c.gray(`── уровень ${currentLevel} ` + '─'.repeat(40)) })
		}
		const total = pack.tasks.size
		const done = [...pack.tasks.keys()].filter(id => progress?.tasks?.[id] === 'pass').length
		items.push({
			label: c.cyan(padEnd(pack.code, 6)) + padEnd(pack.title, 24),
			right: bar(done, total, 14) + ' ' + c.gray(`${done}/${total}`),
			action: () => push(tasksScreen(pack)),
		})
	}

	return { title: 'ПАКИ', hint: 'слева код пака, справа сколько задач сдано', items }
}

function tasksScreen(pack) {
	const items = [...pack.tasks.values()].map(task => ({
		label: `${taskMark(task.id)} ${c.cyan(padEnd(task.id, 9))}${padEnd(task.stars || '', 5)}${task.title}`,
		action: () => push(taskScreen(pack, task)),
	}))

	return {
		title: `${pack.code} · ${pack.title}` + c.gray(`  — ${pack.subtitle}`),
		hint: `${pack.why ?? ''}`.slice(0, 68),
		items,
	}
}

function taskScreen(pack, task) {
	return {
		title: `${task.id} · ${task.title} ${c.gray(task.stars)}`,
		hint: path
			.relative(ROOT, task.file ?? pack.tasksFile)
			.split(path.sep)
			.join('/'),
		items: [
			{
				label: 'Решать' + c.gray('  — открыть в редакторе и гонять её тесты'),
				action: () => runYarn('solve.mjs', [task.id]),
			},
			{
				label: 'Карточка в буфер' + c.gray('  — вставить в claude.ai'),
				action: () => runYarn('task.mjs', [task.id, '-c']),
			},
			{
				label: 'Показать условие и тесты',
				action: () => runYarn('task.mjs', [task.id]),
			},
			{
				label: 'Эталонное решение' + c.red('  — только после своей попытки'),
				action: () => runYarn('task.mjs', [task.id, '-s']),
			},
			{
				label: c.yellow('Сбросить эту задачу'),
				action: () => runYarn('clean.mjs', [task.id, '-y']),
			},
			{ label: c.gray('Назад'), action: () => back() },
		],
	}
}

function cleanScreen() {
	const levels = [...new Set(packs.map(pack => pack.level))].sort()

	return {
		title: 'СБРОС РЕШЕНИЙ',
		hint: 'возвращает файлы к исходным заготовкам — решения стираются',
		items: [
			{
				label: 'Показать, что тронуто' + c.gray('  — ничего не меняет'),
				action: () => runYarn('clean.mjs'),
			},
			{
				label: 'Выбрать пак',
				action: () =>
					push({
						title: 'СБРОСИТЬ ПАК',
						hint: 'подтверждение спросят перед удалением',
						items: packs.map(pack => ({
							label: c.cyan(padEnd(pack.code, 6)) + pack.title,
							action: () => runYarn('clean.mjs', [pack.code]),
						})),
					}),
			},
			{
				label: 'Выбрать уровень',
				action: () =>
					push({
						title: 'СБРОСИТЬ УРОВЕНЬ',
						items: levels.map(level => ({
							label:
								`уровень ${level}` +
								c.gray(`  — ${packs.filter(p => p.level === level).length} паков`),
							action: () => runYarn('clean.mjs', ['--level', String(level)]),
						})),
					}),
			},
			{
				label: 'Только зачтённые задачи',
				action: () => runYarn('clean.mjs', ['--done']),
			},
			{
				label: c.red('Сбросить весь тренажёр'),
				action: () => runYarn('clean.mjs', ['--all']),
			},
			{
				label: c.gray('Пересобрать эталоны (stubs.json)'),
				action: () => runYarn('clean.mjs', ['--snapshot']),
			},
			{ label: c.gray('Назад'), action: () => back() },
		],
	}
}

function checksScreen() {
	const bin = name => path.join(ROOT, 'node_modules', name)

	return {
		title: 'ПРОВЕРКИ',
		items: [
			{
				label: 'Тесты один раз' + c.gray('  — yarn test'),
				action: () => run([path.join(bin('vitest'), 'vitest.mjs'), 'run'], { pause: true }),
			},
			{
				label: 'Тесты в watch' + c.gray('  — yarn t'),
				action: () => run([path.join(bin('vitest'), 'vitest.mjs'), '--hideSkippedTests']),
			},
			{
				label: 'Типы' + c.gray('  — yarn typecheck'),
				action: () =>
					run([path.join(bin('typescript'), 'bin', 'tsc'), '-p', 'tsconfig.app.json'], {
						pause: true,
					}),
			},
			{
				label: 'Эталоны целы' + c.gray('  — yarn verify'),
				action: () => runYarn('verify-types.mjs'),
			},
			{
				label: 'Линт' + c.gray('  — yarn lint'),
				action: () => run([path.join(bin('eslint'), 'bin', 'eslint.js'), '.'], { pause: true }),
			},
			{ label: c.gray('Назад'), action: () => back() },
		],
	}
}

function helpScreen() {
	const rows = [
		['yarn menu', 'это меню'],
		['yarn solve', 'первая нерешённая задача'],
		['yarn solve BAS-07', 'конкретная задача'],
		['yarn solve BAS', 'первая нерешённая в паке'],
		['yarn task', 'список паков'],
		['yarn task BAS', 'список задач пака'],
		['yarn task BAS-07 -c', 'карточка задачи в буфер'],
		['yarn task BAS-07 -s', 'карточка вместе с эталоном'],
		['yarn progress', 'прогнать всё и показать таблицу'],
		['yarn progress BAS', 'то же, но с разбивкой по задачам пака'],
		['yarn clean', 'что тронуто относительно заготовок'],
		['yarn clean BAS-07', 'сбросить одну задачу'],
		['yarn clean BAS', 'сбросить пак'],
		['yarn clean --level 1', 'сбросить все паки уровня'],
		['yarn clean --done', 'сбросить только зачтённые'],
		['yarn clean --all', 'сбросить всё'],
		['yarn t', 'тесты в watch'],
		['yarn test', 'тесты один раз'],
		['yarn typecheck', 'проверка типов'],
		['yarn verify', 'эталоны и типы целы'],
		['yarn lint', 'eslint'],
	]

	const width = Math.max(...rows.map(row => row[0].length)) + 3

	return {
		title: 'ВСЕ КОМАНДЫ',
		hint: 'Enter на строке — скопировать команду в буфер',
		items: rows.map(([command, about]) => ({
			label: c.cyan(padEnd(command, width)) + c.gray(about),
			action: () => {
				copy(command)
				message = c.green(`скопировано: ${command}`)
			},
		})),
	}
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
	console.log(c.gray('  Пока. Возвращайся: ') + c.cyan('yarn menu') + '\n')
	process.exit(0)
}

/** Пропускаем разделители уровней — на них нельзя встать курсором. */
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
	const item = stack[stack.length - 1].items[selected]
	if (!item || item.separator) return
	message = ''
	await item.action()
}

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', async (_char, key) => {
	if (!key || busy) return
	if (key.ctrl && key.name === 'c') return quit()

	switch (key.name) {
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
			selected = 0
			if (stack[stack.length - 1].items[0]?.separator) step(1)
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

push(mainScreen())
render()
