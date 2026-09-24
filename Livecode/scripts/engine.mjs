/**
 * Движок проверок: запуск vitest и tsc с разбором вывода в структуру.
 * Ничего не печатает — печатают вызывающие команды.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { CACHE_DIR, fileOf, relativePath, ROOT } from './lib.mjs'

const VITEST = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
const TSC = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
const TSCONFIG = 'tsconfig.app.json'

export const hasVitest = () => fs.existsSync(VITEST)
export const hasTsc = () => fs.existsSync(TSC)

function cacheFile(name) {
	fs.mkdirSync(CACHE_DIR, { recursive: true })
	return path.join(CACHE_DIR, name)
}

/** Дочерний процесс node с собранным stdout/stderr. Никогда не падает исключением. */
function runNode(args, { cwd = ROOT } = {}) {
	return new Promise(resolve => {
		let stdout = ''
		let stderr = ''
		const child = spawn(process.execPath, args, { cwd, windowsHide: true })
		child.stdout.on('data', chunk => (stdout += chunk))
		child.stderr.on('data', chunk => (stderr += chunk))
		child.on('error', error => resolve({ status: 1, stdout, stderr: String(error) }))
		child.on('close', status => resolve({ status: status ?? 1, stdout, stderr }))
	})
}

// ── тесты ──────────────────────────────────────────────────────────────

/** `BAS-07 countdown ноль` → `BAS-07`. */
const idOf = assertion => {
	const source = assertion.ancestorTitles?.[0] ?? assertion.fullName ?? ''
	return source.match(/^[A-Z]{2,4}-\d+/)?.[0] ?? null
}

/** Заголовок ошибки: всё до первой строки стека. */
function messageOf(raw) {
	const text = String(raw ?? '').replace(/\x1b\[[0-9;]*m/g, '')
	const stop = text.split('\n').findIndex(entry => /^\s+at\s/.test(entry))
	return (stop === -1 ? text : text.split('\n').slice(0, stop).join('\n')).trim()
}

/** Первый кадр стека, указывающий в код тренажёра, а не в vitest или в заглушку todo(). */
function frameOf(raw) {
	const text = String(raw ?? '').replace(/\\/g, '/')
	for (const entry of text.split('\n')) {
		if (!/^\s+at\s/.test(entry)) continue
		const match = entry.match(/((?:src)\/[^\s():]+):(\d+):(\d+)/)
		if (!match) continue
		if (match[1].includes('src/shared/kit')) continue
		return `${match[1]}:${match[2]}`
	}
	return null
}

const NOT_IMPLEMENTED = /NotImplementedError|не реализовано/

/**
 * Прогон тестов. `dirs` сужает до папок паков, `ids` — до конкретных задач.
 * Возвращает Map<id, { total, passed, cases }> плюс список сломанных файлов.
 */
export async function runTests({ dirs = [], ids = [] } = {}) {
	const byTask = new Map()
	const broken = new Set()

	if (!hasVitest()) return { byTask, broken, error: 'vitest не установлен' }

	const report = cacheFile(`report-${process.pid}.json`)
	fs.rmSync(report, { force: true })

	// Пути идут сразу за `run`: следом за флагом без значения cac съедает позиционный
	// аргумент и падает («Unexpected value --silent=src/...»). По той же причине --silent=true.
	const args = [
		VITEST,
		'run',
		...dirs,
		'--reporter=json',
		`--outputFile=${report}`,
		'--silent=true',
	]
	// Якорь ^ и граница \b не дают BAS-1 утащить за собой BAS-10..BAS-19.
	if (ids.length > 0) args.push('-t', ids.map(id => `^${id}\\b`).join('|'))

	const result = await runNode(args)

	if (!fs.existsSync(report)) {
		return {
			byTask,
			broken,
			error: (result.stderr || result.stdout || 'vitest не отдал отчёт').slice(-2000),
		}
	}

	let parsed
	try {
		parsed = JSON.parse(fs.readFileSync(report, 'utf8'))
	} catch {
		return { byTask, broken, error: 'отчёт vitest повреждён' }
	} finally {
		fs.rmSync(report, { force: true })
	}

	for (const file of parsed.testResults ?? []) {
		const assertions = file.assertionResults ?? []
		// Файл без единого результата и не зелёный — упал на импорте: считать нечего.
		if (assertions.length === 0 && file.status !== 'passed') broken.add(path.resolve(file.name))

		for (const assertion of assertions) {
			if (assertion.status === 'skipped' || assertion.status === 'pending') continue
			const id = idOf(assertion)
			if (!id) continue

			const entry = byTask.get(id) ?? { total: 0, passed: 0, cases: [] }
			const ok = assertion.status === 'passed'
			const raw = assertion.failureMessages?.[0] ?? ''

			entry.total += 1
			if (ok) entry.passed += 1
			entry.cases.push({
				title: assertion.title,
				ok,
				blank: !ok && NOT_IMPLEMENTED.test(raw),
				message: ok ? null : messageOf(raw),
				at: ok ? null : frameOf(raw),
			})
			byTask.set(id, entry)
		}
	}

	return { byTask, broken, error: null }
}

// ── типы ───────────────────────────────────────────────────────────────

/**
 * tsc по выбранным файлам. Программа из одного файла собирается за доли секунды,
 * поэтому проверка типов не мешает быстрой проверке задачи.
 * Пустой список файлов означает «весь проект».
 */
export async function runTypes(files = []) {
	if (!hasTsc()) return { errors: [], skipped: true }

	let project = TSCONFIG
	let temporary = null

	if (files.length > 0) {
		temporary = path.join(ROOT, `.tsconfig.check-${process.pid}.json`)
		fs.writeFileSync(
			temporary,
			JSON.stringify({ extends: `./${TSCONFIG}`, include: files.map(relativePath) }),
		)
		project = path.basename(temporary)
	}

	try {
		const result = await runNode([TSC, '-p', project, '--noEmit', '--pretty', 'false'])
		const errors = []
		for (const entry of `${result.stdout}\n${result.stderr}`.split(/\r?\n/)) {
			const match = entry.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/)
			if (!match) continue
			errors.push({
				file: path.resolve(ROOT, match[1]),
				line: Number(match[2]),
				column: Number(match[3]),
				code: match[4],
				message: match[5],
			})
		}
		return { errors, skipped: false }
	} finally {
		if (temporary) fs.rmSync(temporary, { force: true })
	}
}

/** Ошибки типов, попавшие внутрь региона задачи. */
export const typeErrorsFor = (errors, pack, task) => {
	const file = path.resolve(fileOf(pack, task))
	return errors.filter(
		error => error.file === file && error.line >= task.startLine && error.line <= task.endLine,
	)
}

// ── вердикт ────────────────────────────────────────────────────────────

/**
 * Прогон тестов и типов разом и вердикт по каждой задаче.
 * Задача сдана, когда зелены и тесты, и типы. Задача без тестов (пак про типы)
 * держится на одном tsc, а упавший на импорте файл тестов не засчитывает ничего.
 */
export async function evaluate(targets, { dirs, ids, allTypes = false } = {}) {
	const files = allTypes ? [] : [...new Set(targets.map(({ pack, task }) => fileOf(pack, task)))]

	const [tests, types] = await Promise.all([
		runTests({ dirs, ids }),
		runTypes(files.length > 200 ? [] : files),
	])

	const results = targets.map(({ pack, task }) => {
		const stats = tests.byTask.get(task.id) ?? null
		const typeErrors = typeErrorsFor(types.errors, pack, task)
		const packBroken = pack.testFile ? tests.broken.has(path.resolve(pack.testFile)) : false
		// Тестов у задачи нет вовсе — значит её проверяет компилятор, а не рантайм.
		const typesOnly = !pack.tests.has(task.id)
		// Тесты есть, но результатов нет: файл не запустился или describe переименовали.
		const missing = !typesOnly && !stats

		const broken = packBroken || missing
		const failed = typeErrors.length > 0 || (stats ? stats.passed < stats.total : false)

		const status = broken || failed ? (stats?.passed > 0 ? 'partial' : 'fail') : 'pass'

		return { pack, task, status, stats, typeErrors, packBroken, missing, typesOnly }
	})

	return { results, tests, types }
}
