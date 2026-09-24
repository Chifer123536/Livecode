import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { barOf, resolveColors } from './theme.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DRILLS = path.join(ROOT, 'src', 'drills')
export const PROGRESS_FILE = path.join(ROOT, '.progress.json')
export const CURRENT_FILE = path.join(ROOT, '.current.json')
export const CACHE_DIR = path.join(ROOT, 'node_modules', '.cache', 'drills')
export const UI_FILE = path.join(ROOT, '.ui.json')

/**
 * Цвет. NO_COLOR выключает, FORCE_COLOR включает принудительно.
 * Глубина определяется один раз: 24 бита там, где терминал это заявляет,
 * иначе 8-битная палитра, иначе базовые 16 цветов.
 */
const forced = process.env.FORCE_COLOR !== undefined
const useColor = forced || (process.env.NO_COLOR === undefined && process.env.TERM !== 'dumb')

const depth = (() => {
	if (!useColor) return 0
	const term = process.env.TERM ?? ''
	const colorterm = process.env.COLORTERM ?? ''
	if (/truecolor|24bit/i.test(colorterm)) return 24
	// Windows Terminal и современный conhost умеют 24 бита, но COLORTERM не выставляют.
	if (process.platform === 'win32') return 24
	if (/256|kitty|alacritty/i.test(term)) return 8
	return 4
})()

const ESC = '\x1b['
const wrap = (open, close) => s => (useColor ? `${ESC}${open}m${s}${ESC}${close}m` : String(s))

/** Приблизить произвольный RGB к ближайшему из 16 базовых цветов. */
function basic(r, g, b) {
	const bright = Math.max(r, g, b) > 160 ? 60 : 0
	const code = (r > 110 ? 1 : 0) | (g > 110 ? 2 : 0) | (b > 110 ? 4 : 0)
	return 30 + code + bright
}

/** Цвет по RGB с деградацией под возможности терминала. */
export const rgb =
	(r, g, b) =>
	(text, { bg = false } = {}) => {
		if (!useColor) return String(text)
		const layer = bg ? 48 : 38
		const reset = bg ? 49 : 39
		if (depth === 24) return `${ESC}${layer};2;${r};${g};${b}m${text}${ESC}${reset}m`
		if (depth === 8) {
			const level = v => Math.round((Math.max(0, Math.min(255, v)) / 255) * 5)
			const index = 16 + 36 * level(r) + 6 * level(g) + level(b)
			return `${ESC}${layer};5;${index}m${text}${ESC}${reset}m`
		}
		return `${ESC}${basic(r, g, b) + (bg ? 10 : 0)}m${text}${ESC}${reset}m`
	}

// ── оформление ─────────────────────────────────────────────────────────

/** Настройки внешнего вида. Меняются в меню, лежат в `.ui.json`. */
export const DEFAULT_UI = { theme: 'midnight', contrast: 'normal', panel: true, bar: 'blocks' }

function readUiFile() {
	try {
		const raw = JSON.parse(fs.readFileSync(UI_FILE, 'utf8'))
		return raw && typeof raw === 'object' ? raw : {}
	} catch {
		return {}
	}
}

export const ui = { ...DEFAULT_UI, ...readUiFile() }

let colors = resolveColors(ui)

/**
 * Применить настройки на лету: следующий же вызов палитры возьмёт новые цвета.
 * Благодаря этому меню перерисовывается в новой теме без перезапуска.
 */
export function applyUi(patch = {}) {
	Object.assign(ui, patch)
	colors = resolveColors(ui)
	return ui
}

export function saveUi() {
	try {
		fs.writeFileSync(UI_FILE, JSON.stringify(ui, null, '	'))
	} catch {
		/* настройки — удобство, а не состояние */
	}
}

/** Активный цвет темы как тройка RGB. */
export const colorOf = name => colors[name]

/**
 * Готовая escape-последовательность фона. Нужна меню: подложка экрана рвётся
 * на каждой плашке, потому что вложенный фон сбрасывается в «по умолчанию»,
 * а не в цвет панели. Зная код, меню восстанавливает его само.
 */
export function bgCode(name) {
	if (!useColor) return ''
	const [r, g, b] = colors[name]
	if (depth === 24) return `${ESC}48;2;${r};${g};${b}m`
	if (depth === 8) {
		const level = v => Math.round((Math.max(0, Math.min(255, v)) / 255) * 5)
		return `${ESC}48;5;${16 + 36 * level(r) + 6 * level(g) + level(b)}m`
	}
	return `${ESC}${basic(r, g, b) + 10}m`
}

export const BG_RESET = useColor ? `${ESC}49m` : ''

/** Токен палитры: цвет берётся в момент печати, а не при импорте. */
const token = name => (text, options) => rgb(...colors[name])(text, options)

/** Палитра тренажёра. Имена одинаковы во всех темах, значения — из темы. */
export const palette = {
	accent: token('accent'),
	sky: token('sky'),
	mint: token('mint'),
	amber: token('amber'),
	rose: token('rose'),
	violet: token('violet'),
	snow: token('snow'),
	ink: token('ink'),
	faint: token('faint'),
	surface: token('surface'),
	/** Фоновые токены: поверх них печатается snow. */
	chip: token('chip'),
	select: token('select'),
	panel: token('panel'),
}

export const c = {
	bold: wrap(1, 22),
	dim: wrap(2, 22),
	italic: wrap(3, 23),
	inverse: wrap(7, 27),
	red: palette.rose,
	green: palette.mint,
	yellow: palette.amber,
	blue: palette.accent,
	magenta: palette.violet,
	cyan: palette.accent,
	gray: palette.faint,
	ink: palette.ink,
	/** Подложка выделенной строки. */
	on: text => palette.select(text, { bg: true }),
}

/** Строка без ANSI-последовательностей: нужна и для замера, и для выравнивания. */
export const strip = s => String(s).replace(/\x1b\[[0-9;]*m/g, '')

export const visibleWidth = s => strip(s).length

export const padEnd = (s, width) => s + ' '.repeat(Math.max(0, width - visibleWidth(s)))

export const padStart = (s, width) => ' '.repeat(Math.max(0, width - visibleWidth(s))) + s

/** Ширина полезной области вывода: узкие окна не должны рвать таблицы. */
export const termWidth = () =>
	Math.max(
		56,
		// В консоли меню вывод идёт в трубу: терминала нет, ширину передаёт меню через COLUMNS.
		Math.min(100, (process.stdout.columns ?? (Number(process.env.COLUMNS) || 90)) - 4),
	)

/** Первый существующий файл из списка кандидатов. */
function firstExisting(dir, names) {
	for (const name of names) {
		const full = path.join(dir, name)
		if (fs.existsSync(full)) return full
	}
	return null
}

/**
 * Кеш разбора по «путь + время правки». Меню перечитывает паки после каждой команды,
 * а это под тысячу файлов: без кеша возврат из задачи заметно подвисал.
 */
const regionCache = new Map()

/**
 * Разбирает файл на блоки, размеченные `// #region ID | Заголовок | ★☆☆` ... `// #endregion`.
 * Возвращает Map<id, { id, title, stars, body }>.
 */
export function parseRegions(file) {
	const result = new Map()
	if (!file || !fs.existsSync(file)) return result

	const stamp = mtimeOf(file)
	const cached = regionCache.get(file)
	if (cached && cached.stamp === stamp) return cached.regions

	const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
	let current = null

	lines.forEach((line, index) => {
		const lineNumber = index + 1
		const open = line.match(/^\s*\/\/\s*#region\s+(.+)$/)
		if (open) {
			const [id, title = '', stars = ''] = open[1].split('|').map(s => s.trim())
			current = { id, title, stars, lines: [], startLine: lineNumber }
			return
		}
		if (/^\s*\/\/\s*#endregion/.test(line)) {
			if (current) {
				result.set(current.id, {
					...current,
					endLine: lineNumber,
					body: current.lines.join('\n').trim(),
				})
			}
			current = null
			return
		}
		if (current) current.lines.push(line)
	})

	regionCache.set(file, { stamp, regions: result })
	return result
}

/**
 * Задачи пака. Каждая лежит в своём файле в `tasks/`, служебные файлы начинаются с подчёркивания.
 * Старая раскладка (все задачи в одном tasks.ts) тоже поддерживается.
 */
function loadTasks(dir, fallbackFile) {
	const tasksDir = path.join(dir, 'tasks')
	if (!fs.existsSync(tasksDir) || !fs.statSync(tasksDir).isDirectory())
		return parseRegions(fallbackFile)

	const result = new Map()
	for (const name of fs.readdirSync(tasksDir).sort()) {
		if (name.startsWith('_')) continue
		const file = path.join(tasksDir, name)
		for (const [id, task] of parseRegions(file)) result.set(id, { ...task, file })
	}
	return result
}

/** Все паки, отсортированные по order. */
export function loadPacks() {
	if (!fs.existsSync(DRILLS)) return []

	return (
		fs
			.readdirSync(DRILLS, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => {
				const dir = path.join(DRILLS, entry.name)
				const metaFile = path.join(dir, 'pack.json')
				if (!fs.existsSync(metaFile)) return null

				const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
				const tasksFile = firstExisting(dir, ['tasks.tsx', 'tasks.ts'])
				const solutionFile = firstExisting(dir, ['solution.tsx', 'solution.ts'])
				const testFile = firstExisting(dir, ['tasks.test.tsx', 'tasks.test.ts'])
				const tasks = loadTasks(dir, tasksFile)

				return {
					...meta,
					dir,
					name: entry.name,
					tasksFile,
					solutionFile,
					testFile,
					tasks,
					solutions: parseRegions(solutionFile),
					tests: parseRegions(testFile),
				}
			})
			.filter(Boolean)
			// Сначала по уровню, внутри уровня — по порядку. Иначе пак с маленьким уровнем,
			// но большим номером выпадал бы отдельной группой в самом конце списка.
			.sort((a, b) => (a.level ?? 9) - (b.level ?? 9) || (a.order ?? 99) - (b.order ?? 99))
	)
}

/** Плоский список всех задач в порядке прохождения. */
export const allTasks = packs =>
	packs.flatMap(pack => [...pack.tasks.values()].map(task => ({ pack, task })))

export function findTask(packs, id) {
	const wanted = String(id).toUpperCase()
	for (const pack of packs) {
		if (pack.tasks.has(wanted)) return { pack, task: pack.tasks.get(wanted) }
	}
	return null
}

export function findPack(packs, code) {
	const wanted = String(code).toUpperCase()
	return (
		packs.find(
			p => p.code.toUpperCase() === wanted || p.name.toLowerCase() === String(code).toLowerCase(),
		) ?? null
	)
}

/** Файл, в котором лежит задача. */
export const fileOf = (pack, task) => task.file ?? pack.tasksFile

/** Путь от корня тренажёра, всегда через прямые слэши — так его читают и редактор, и глаз. */
export const relativePath = file => path.relative(ROOT, file).split(path.sep).join('/')

export const mtimeOf = file => {
	try {
		return fs.statSync(file).mtimeMs
	} catch {
		return 0
	}
}

// ── прогресс ───────────────────────────────────────────────────────────

const BLANK_ENTRY = { status: 'none', passed: 0, total: 0, types: 0, mtime: 0, at: null }

/**
 * Прогресс с диска. Старый формат (`tasks: { ID: 'pass' }`) тоже читается:
 * строка разворачивается в запись при обращении через entryOf.
 */
export function readProgress() {
	if (!fs.existsSync(PROGRESS_FILE)) return null
	try {
		return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
	} catch {
		return null
	}
}

export function writeProgress(progress) {
	try {
		fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, '\t'))
	} catch {
		/* прогресс — кеш, его потеря не критична */
	}
}

/** Запись о задаче в едином виде, независимо от версии файла прогресса. */
export function entryOf(progress, id) {
	const raw = progress?.tasks?.[id]
	if (!raw) return null
	if (typeof raw === 'string') return { ...BLANK_ENTRY, status: raw }
	return { ...BLANK_ENTRY, ...raw }
}

/** 'pass' | 'partial' | 'fail' | null — null означает «не проверялась». */
export const statusOf = (progress, id) => entryOf(progress, id)?.status ?? null

/**
 * Проверка устарела, если файл задачи правился после неё.
 * У старого формата отметки времени нет — такая запись считается свежей,
 * иначе после обновления тренажёра всё разом покраснело бы.
 */
export function isTaskStale(progress, id, file) {
	const entry = entryOf(progress, id)
	if (!entry?.mtime) return false
	return mtimeOf(file) > entry.mtime + 1
}

/** Задачи, которые правились после последней проверки. */
export function staleTasks(packs, progress = readProgress()) {
	if (!progress) return []
	return allTasks(packs).filter(({ pack, task }) =>
		isTaskStale(progress, task.id, fileOf(pack, task)),
	)
}

/** Первая несданная задача в порядке «от простого к сложному». */
export function firstUnsolved(packs, progress = readProgress()) {
	return allTasks(packs).find(({ task }) => statusOf(progress, task.id) !== 'pass') ?? null
}

/** Счётчик сданного по паку — из кеша прогресса, без прогона тестов. */
export function packScore(pack, progress) {
	const total = pack.tasks.size
	const done = [...pack.tasks.keys()].filter(id => statusOf(progress, id) === 'pass').length
	return { done, total }
}

// ── текущая задача ─────────────────────────────────────────────────────

/** Задача, открытая последней. На неё по умолчанию смотрят `yarn ok` и `yarn watch`. */
export function readCurrent() {
	try {
		const raw = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf8'))
		return typeof raw?.id === 'string' ? raw.id : null
	} catch {
		return null
	}
}

export function writeCurrent(id) {
	try {
		fs.writeFileSync(CURRENT_FILE, JSON.stringify({ id, at: new Date().toISOString() }, null, '\t'))
	} catch {
		/* указатель — удобство, а не состояние */
	}
}

// ── индикаторы ─────────────────────────────────────────────────────────

/**
 * Полоска прогресса с градиентом: от розового к мятному по мере заполнения.
 * Последний символ — дробный, поэтому движение видно и на одной решённой задаче.
 */
export function bar(done, total, width = 24) {
	const glyphs = barOf(ui.bar)
	if (total === 0) return palette.surface(glyphs.empty.repeat(width))

	const ratio = Math.max(0, Math.min(1, done / total))
	const exact = ratio * width
	const full = Math.floor(exact)
	const remainder = exact - full

	// Градиент по позиции: начало полосы цвета акцента, конец — цвет завершения.
	const mix = (from, to, t) => Math.round(from + (to - from) * t)
	const head = colors.violet
	const tail = done === total ? colors.mint : colors.accent

	let out = ''
	for (let index = 0; index < full; index += 1) {
		const t = width === 1 ? 1 : index / (width - 1)
		out += rgb(
			mix(head[0], tail[0], t),
			mix(head[1], tail[1], t),
			mix(head[2], tail[2], t),
		)(glyphs.full)
	}

	let rest = width - full
	if (remainder > 0.15 && rest > 0) {
		const partial = glyphs.parts[remainder > 0.6 ? 2 : remainder > 0.35 ? 1 : 0]
		const t = width === 1 ? 1 : full / (width - 1)
		out += rgb(
			mix(head[0], tail[0], t),
			mix(head[1], tail[1], t),
			mix(head[2], tail[2], t),
		)(partial)
		rest -= 1
	}

	return out + palette.surface(glyphs.empty.repeat(Math.max(0, rest)))
}

/** Процент в компактном виде: 0%, 7%, 100%. */
export const percentOf = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100))
