import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DRILLS = path.join(ROOT, 'src', 'drills')
export const PROGRESS_FILE = path.join(ROOT, '.progress.json')

const useColor = process.env.NO_COLOR === undefined && process.env.TERM !== 'dumb'
const wrap = (open, close) => s => (useColor ? `[${open}m${s}[${close}m` : String(s))

export const c = {
	bold: wrap(1, 22),
	dim: wrap(2, 22),
	red: wrap(31, 39),
	green: wrap(32, 39),
	yellow: wrap(33, 39),
	blue: wrap(34, 39),
	magenta: wrap(35, 39),
	cyan: wrap(36, 39),
	gray: wrap(90, 39),
}

/** Ширина строки без ANSI-последовательностей. */
export const visibleWidth = s => s.replace(/\[\d+m/g, '').length

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

/** Полоска прогресса из блочных символов. */
export function bar(done, total, width = 24) {
	if (total === 0) return c.gray('─'.repeat(width))
	const filled = Math.round((done / total) * width)
	const color = done === total ? c.green : done === 0 ? c.gray : c.yellow
	return color('█'.repeat(filled)) + c.gray('░'.repeat(width - filled))
}
