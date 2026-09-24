/**
 * Консоль внутри меню: строка ввода и вывод команд на том же экране, под меню.
 *
 * Команды тренажёра (`yarn ok BAS-08` или просто `ok BAS-08`) запускаются напрямую
 * через node — без yarn и без оболочки, это быстрее на полсекунды. Всё остальное
 * уходит в PowerShell (на Windows) или sh. Вывод читается из трубы: цвета SGR
 * сохраняются, прочие управляющие последовательности вырезаются, чтобы чужая
 * команда не могла сдвинуть курсор или стереть экран меню.
 *
 * Модуль ничего не рисует сам: отдаёт готовые строки, меню вставляет их в кадр.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import { CACHE_DIR, ROOT } from './lib.mjs'

const MAX_LINES = 2000
const MAX_HISTORY = 100
const HISTORY_FILE = path.join(CACHE_DIR, 'console-history.json')

/** Команды тренажёра → скрипт. Пишутся с `yarn` и без. */
const SCRIPTS = {
	go: 'solve.mjs',
	solve: 'solve.mjs',
	ok: 'check.mjs',
	how: 'how.mjs',
	explain: 'how.mjs',
	task: 'task.mjs',
	progress: 'progress.mjs',
	clean: 'clean.mjs',
	watch: 'watch.mjs',
	shell: 'shell/install.mjs',
	verify: 'verify.mjs',
	types: 'verify-types.mjs',
}

/** Инструменты, которые в package.json вызываются через бинарники. */
const bin = (...parts) => path.join(ROOT, 'node_modules', ...parts)
const TOOLS = {
	test: [bin('vitest', 'vitest.mjs'), 'run'],
	// --watch явно: без терминала vitest иначе молча переходит в разовый прогон.
	t: [bin('vitest', 'vitest.mjs'), '--watch', '--hideSkippedTests'],
	typecheck: [bin('typescript', 'bin', 'tsc'), '-p', 'tsconfig.app.json'],
	lint: [bin('eslint', 'bin', 'eslint.js'), '.'],
}

/** После этих команд Tab дополняет коды задач и паков. */
const TASK_COMMANDS = new Set([
	'go',
	'solve',
	'ok',
	'how',
	'explain',
	'task',
	'clean',
	'watch',
	'progress',
])

export const COMMAND_NAMES = [...Object.keys(SCRIPTS), ...Object.keys(TOOLS)].sort()

// ── очистка вывода ─────────────────────────────────────────────────────

/**
 * Оставить от вывода только текст и цвета. Курсорные команды, очистка экрана,
 * заголовки окна и прочее управление терминалом в чужом выводе сломали бы кадр меню.
 */
function sanitize(text) {
	return text
		.replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
		.replace(/\x1b\[[0-9;?]*[A-Za-ln-z@`]/g, '')
		.replace(/\x1b[()][A-Z0-9]/g, '')
		.replace(/\x1b[=>78DEHM]/g, '')
		.replace(/\t/g, '    ')
		.replace(/[\x00-\x08\x0b\x0c\x0e-\x1a\x1c-\x1f\x7f]/g, '')
}

/** Возврат каретки перезаписывает строку — берём то, что осталось видно последним. */
function settle(line) {
	if (!line.includes('\r')) return line
	const parts = line.split('\r')
	const last = parts[parts.length - 1]
	return last === '' ? (parts[parts.length - 2] ?? '') : last
}

/** Разбить строку ввода на слова, уважая кавычки. */
function words(line) {
	return line.match(/"[^"]*"|'[^']*'|\S+/g)?.map(word => word.replace(/^(["'])(.*)\1$/, '$2')) ?? []
}

function loadHistory() {
	try {
		const list = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
		return Array.isArray(list) ? list.filter(entry => typeof entry === 'string') : []
	} catch {
		return []
	}
}

function saveHistory(list) {
	try {
		fs.mkdirSync(CACHE_DIR, { recursive: true })
		fs.writeFileSync(HISTORY_FILE, JSON.stringify(list.slice(-MAX_HISTORY)))
	} catch {
		/* история — удобство */
	}
}

/**
 * Консоль. `onChange` — вывод или ввод изменились, пора перерисовать.
 * `onDone` — команда завершилась: она могла поменять файлы и прогресс.
 * `ids` — коды задач и паков для Tab.
 */
export function createConsole({ onChange = () => {}, onDone = () => {}, ids = () => [] } = {}) {
	const state = {
		input: '',
		cursor: 0,
		history: loadHistory(),
		historyIndex: null,
		lines: [],
		pending: '',
		/** Сколько строк от низа пропущено при прокрутке вверх. 0 — прилипли к низу. */
		scroll: 0,
		child: null,
		command: '',
		started: 0,
		status: '',
		hint: '',
		cwd: ROOT,
	}

	const push = text => {
		state.lines.push(text)
		if (state.lines.length > MAX_LINES) state.lines.splice(0, state.lines.length - MAX_LINES)
		// Прокрученный вверх вывод стоит на месте, пока приходят новые строки.
		if (state.scroll > 0) state.scroll += 1
	}

	/** Кусок вывода: целые строки в историю, хвост — в незаконченную строку. */
	const feed = chunk => {
		const text = sanitize(chunk.replace(/\r\n/g, '\n'))
		const parts = (state.pending + text).split('\n')
		state.pending = parts.pop() ?? ''
		for (const part of parts) push(settle(part))
		onChange()
	}

	const note = (text, color = 'faint') => {
		push({ note: text, color })
		onChange()
	}

	/** Что запускать для строки ввода. */
	function resolve(line) {
		let [first, ...rest] = words(line)
		if (!first) return null
		const viaYarn = first === 'yarn'
		if (viaYarn) {
			if (rest.length === 0) return { error: 'yarn без команды здесь не нужен — зависимости стоят' }
			;[first, ...rest] = rest
		}

		if (first === 'menu' || first === 'start')
			return { error: 'меню уже открыто — оно над консолью' }
		if (first === 'clear' || first === 'cls') return { clear: true }
		if (first === 'cd') return { cd: rest.join(' ') }
		if (SCRIPTS[first]) {
			return { node: [path.join(ROOT, 'scripts', ...SCRIPTS[first].split('/')), ...rest] }
		}
		if (TOOLS[first]) return { node: [...TOOLS[first], ...rest] }
		return { shell: line }
	}

	function spawnFor(target, width) {
		const env = {
			...process.env,
			FORCE_COLOR: '1',
			COLUMNS: String(width),
		}
		const options = { cwd: state.cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }

		if (target.node) return spawn(process.execPath, target.node, options)

		if (process.platform === 'win32') {
			// Через -EncodedCommand строка доходит до PowerShell как есть: без борьбы
			// с кавычками командной строки Windows. Вывод — в UTF-8, иначе кириллица сломается.
			const script =
				'[Console]::OutputEncoding = [Text.Encoding]::UTF8; $OutputEncoding = [Text.Encoding]::UTF8; ' +
				target.shell
			return spawn(
				'powershell.exe',
				[
					'-NoProfile',
					'-NoLogo',
					'-NonInteractive',
					'-EncodedCommand',
					Buffer.from(script, 'utf16le').toString('base64'),
				],
				options,
			)
		}
		return spawn('sh', ['-c', target.shell], { ...options, detached: true })
	}

	/** Выполнить строку. `width` — ширина вывода, её получат команды как COLUMNS. */
	function run(line, width = 90) {
		const text = line.trim()
		if (!text) return
		if (state.child) {
			note('уже выполняется «' + state.command + '» — Ctrl+C остановит', 'amber')
			return
		}

		state.history = [...state.history.filter(entry => entry !== text), text].slice(-MAX_HISTORY)
		state.historyIndex = null
		saveHistory(state.history)

		const target = resolve(text)
		if (!target) return
		state.scroll = 0

		if (state.lines.length) push('')
		push({ prompt: text, cwd: state.cwd })

		if (target.error) return note(target.error, 'amber')
		if (target.clear) {
			state.lines = []
			state.pending = ''
			state.status = ''
			return onChange()
		}
		if (target.cd !== undefined) {
			const next = path.resolve(state.cwd, target.cd || ROOT)
			if (fs.existsSync(next) && fs.statSync(next).isDirectory()) {
				state.cwd = next
				return note(next)
			}
			return note('нет такой папки: ' + next, 'rose')
		}

		let child
		try {
			child = spawnFor(target, width)
		} catch (error) {
			return note('не запустилось: ' + error.message, 'rose')
		}

		state.child = child
		state.command = text
		state.started = Date.now()
		state.status = ''

		const out = new StringDecoder('utf8')
		const err = new StringDecoder('utf8')
		child.stdout.on('data', chunk => feed(out.write(chunk)))
		child.stderr.on('data', chunk => feed(err.write(chunk)))
		child.on('error', error => note('не запустилось: ' + error.message, 'rose'))
		child.on('close', code => {
			feed(out.end() + err.end())
			if (state.pending) {
				push(settle(state.pending))
				state.pending = ''
			}
			const seconds = ((Date.now() - state.started) / 1000).toFixed(1)
			state.status = code === 0 ? `✓ ${seconds}с` : `✗ код ${code ?? '—'} · ${seconds}с`
			state.child = null
			onDone()
			onChange()
		})
		onChange()
	}

	/** Остановить команду вместе с дочерними процессами. */
	function kill() {
		const child = state.child
		if (!child) return false
		try {
			if (process.platform === 'win32') {
				spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
					windowsHide: true,
					stdio: 'ignore',
				})
			} else {
				process.kill(-child.pid, 'SIGTERM')
			}
		} catch {
			/* процесс уже завершился */
		}
		note('остановлено', 'amber')
		return true
	}

	/** Tab: дополнить последнее слово командой, кодом задачи или пака. */
	function complete() {
		const before = state.input.slice(0, state.cursor)
		const after = state.input.slice(state.cursor)
		const parts = before.split(/\s+/)
		const word = parts[parts.length - 1]
		const typed = parts.slice(0, -1).filter(Boolean)
		if (typed[0] === 'yarn') typed.shift()

		let pool = []
		if (typed.length === 0) pool = parts.length === 1 ? ['yarn', ...COMMAND_NAMES] : COMMAND_NAMES
		else if (TASK_COMMANDS.has(typed[0])) pool = ids()

		const lower = word.toLowerCase()
		const matches = pool.filter(entry => entry.toLowerCase().startsWith(lower))

		if (matches.length === 0) {
			state.hint = pool.length ? 'нет вариантов' : ''
			return
		}

		let replacement
		if (matches.length === 1) {
			replacement = matches[0] + ' '
			state.hint = ''
		} else {
			// Общее начало всех вариантов — дальше дописывать самому.
			let prefix = matches[0]
			for (const entry of matches)
				while (!entry.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1)
			replacement = prefix.length > word.length ? prefix : word
			state.hint =
				matches.slice(0, 14).join('  ') +
				(matches.length > 14 ? `  … ещё ${matches.length - 14}` : '')
		}

		const head = before.slice(0, before.length - word.length) + replacement
		state.input = head + after
		state.cursor = head.length
	}

	function recall(direction) {
		const list = state.history
		if (!list.length) return
		if (state.historyIndex === null) state.historyIndex = list.length
		state.historyIndex = Math.max(0, Math.min(list.length, state.historyIndex + direction))
		state.input = list[state.historyIndex] ?? ''
		state.cursor = state.input.length
	}

	/**
	 * Клавиша в фокусе консоли. Возвращает строку-решение для меню:
	 * 'menu' — уйти в меню, 'handled' — клавиша съедена, null — не наша.
	 */
	function handleKey(char, pressed, width) {
		const name = pressed?.name
		state.hint = name === 'tab' ? state.hint : ''

		if (pressed?.ctrl && name === 'c') {
			if (!kill() && state.input) {
				state.input = ''
				state.cursor = 0
			}
			return 'handled'
		}
		if (pressed?.ctrl && (name === 'up' || name === 'down')) {
			recall(name === 'up' ? -1 : 1)
			return 'handled'
		}

		switch (name) {
			case 'up':
				return 'menu'
			case 'escape':
				if (!state.input) return 'menu'
				state.input = ''
				state.cursor = 0
				return 'handled'
			case 'return': {
				const line = state.input
				state.input = ''
				state.cursor = 0
				run(line, width)
				return 'handled'
			}
			case 'tab':
				complete()
				return 'handled'
			case 'left':
				state.cursor = Math.max(0, state.cursor - 1)
				return 'handled'
			case 'right':
				state.cursor = Math.min(state.input.length, state.cursor + 1)
				return 'handled'
			case 'home':
				state.cursor = 0
				return 'handled'
			case 'end':
				state.cursor = state.input.length
				return 'handled'
			case 'backspace':
				if (state.cursor > 0) {
					state.input = state.input.slice(0, state.cursor - 1) + state.input.slice(state.cursor)
					state.cursor -= 1
				}
				return 'handled'
			case 'delete':
				state.input = state.input.slice(0, state.cursor) + state.input.slice(state.cursor + 1)
				return 'handled'
			case 'pageup':
				state.scroll = Math.min(state.scroll + 8, Math.max(0, state.lines.length - 1))
				return 'handled'
			case 'pagedown':
				state.scroll = Math.max(0, state.scroll - 8)
				return 'handled'
			case 'down':
				return 'handled'
			default:
				break
		}

		if (pressed?.ctrl && name === 'u') {
			state.input = state.input.slice(state.cursor)
			state.cursor = 0
			return 'handled'
		}

		if (char && !pressed?.ctrl && !pressed?.meta && char.length === 1 && char >= ' ') {
			state.input = state.input.slice(0, state.cursor) + char + state.input.slice(state.cursor)
			state.cursor += 1
			return 'handled'
		}
		return 'handled'
	}

	/** Строки вывода для окна высотой `height`: хвост с учётом прокрутки. */
	function visible(height) {
		const all = state.pending ? [...state.lines, state.pending] : state.lines
		const end = Math.max(0, all.length - state.scroll)
		return all.slice(Math.max(0, end - height), end)
	}

	return {
		state,
		run,
		kill,
		handleKey,
		visible,
		get running() {
			return Boolean(state.child)
		},
		get total() {
			return state.lines.length + (state.pending ? 1 : 0)
		},
	}
}
