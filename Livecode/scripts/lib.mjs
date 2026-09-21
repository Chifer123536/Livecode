import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DRILLS = path.join(ROOT, 'src', 'drills')
export const PROGRESS_FILE = path.join(ROOT, '.progress.json')

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

/** Палитра тренажёра: холодный акцент, тёплые статусы. */
export const palette = {
	accent: rgb(96, 165, 250),
	sky: rgb(56, 189, 248),
	mint: rgb(52, 211, 153),
	amber: rgb(251, 191, 36),
	rose: rgb(248, 113, 113),
	violet: rgb(167, 139, 250),
	ink: rgb(148, 163, 184),
	faint: rgb(100, 116, 139),
	surface: rgb(38, 50, 70),
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
	on: text => palette.surface(text, { bg: true }),
}

/** Строка без ANSI-последовательностей: нужна и для замера, и для выравнивания. */
export const strip = s => String(s).replace(/\x1b\[[0-9;]*m/g, '')

export const visibleWidth = s => strip(s).length

export const padEnd = (s, width) => s + ' '.repeat(Math.max(0, width - visibleWidth(s)))

/** Первый существующий файл из списка кандидатов. */
function firstExisting(dir, names) {
	for (const name of names) {
		const full = path.join(dir, name)
		if (fs.existsSync(full)) return full
	}
	return null
}

/**
 * Разбирает файл на блоки, размеченные `// #region ID | Заголовок | ★☆☆` ... `// #endregion`.
 * Возвращает Map<id, { id, title, stars, body }>.
 */
export function parseRegions(file) {
	const result = new Map()
	if (!file || !fs.existsSync(file)) return result

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

export function findTask(packs, id) {
	const wanted = id.toUpperCase()
	for (const pack of packs) {
		if (pack.tasks.has(wanted)) return { pack, task: pack.tasks.get(wanted) }
	}
	return null
}

export function findPack(packs, code) {
	const wanted = code.toUpperCase()
	return (
		packs.find(
			p => p.code.toUpperCase() === wanted || p.name.toLowerCase() === code.toLowerCase(),
		) ?? null
	)
}

export function readProgress() {
	if (!fs.existsSync(PROGRESS_FILE)) return null
	try {
		return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
	} catch {
		return null
	}
}

/**
 * Полоска прогресса с градиентом: от розового к мятному по мере заполнения.
 * Последний символ — дробный, поэтому движение видно и на одной решённой задаче.
 */
export function bar(done, total, width = 24) {
	if (total === 0) return palette.surface('─'.repeat(width))

	const ratio = Math.max(0, Math.min(1, done / total))
	const exact = ratio * width
	const full = Math.floor(exact)
	const remainder = exact - full

	// Градиент по позиции: начало полосы холоднее, конец — цвет завершения.
	const mix = (from, to, t) => Math.round(from + (to - from) * t)
	const head = [244, 114, 182]
	const tail = done === total ? [52, 211, 153] : [96, 165, 250]

	let out = ''
	for (let index = 0; index < full; index += 1) {
		const t = width === 1 ? 1 : index / (width - 1)
		out += rgb(mix(head[0], tail[0], t), mix(head[1], tail[1], t), mix(head[2], tail[2], t))('█')
	}

	let rest = width - full
	if (remainder > 0.15 && rest > 0) {
		const partial = remainder > 0.6 ? '▓' : remainder > 0.35 ? '▒' : '░'
		const t = width === 1 ? 1 : full / (width - 1)
		out += rgb(
			mix(head[0], tail[0], t),
			mix(head[1], tail[1], t),
			mix(head[2], tail[2], t),
		)(partial)
		rest -= 1
	}

	return out + palette.surface('░'.repeat(Math.max(0, rest)))
}

/** Процент в компактном виде: 0%, 7%, 100%. */
export const percentOf = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100))
