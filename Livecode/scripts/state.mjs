#!/usr/bin/env node
/**
 * Расчёт состояния тренажёра: какие задачи сданы, какие нет.
 * Источник истины — сами тесты и компилятор, а не галочки руками.
 *
 * Используется и `yarn progress` (рисует таблицу), и `yarn solve` (ищет следующую).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { c, PROGRESS_FILE, readProgress, ROOT } from './lib.mjs'

const REPORT = path.join(ROOT, '.vitest-report.json')

function runTests({ quiet = false } = {}) {
	if (!quiet) process.stdout.write(c.gray('  гоняю тесты...'))
	const vitestBin = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
	const result = spawnSync(
		process.execPath,
		[vitestBin, 'run', '--reporter=json', `--outputFile=${REPORT}`, '--silent'],
		{ cwd: ROOT, encoding: 'utf8' },
	)
	if (!quiet) process.stdout.write('\r' + ' '.repeat(30) + '\r')

	if (!fs.existsSync(REPORT)) {
		console.log(c.red('Не удалось получить отчёт vitest.'))
		console.log(c.gray(result.stderr?.slice(-1500) ?? ''))
		process.exit(1)
	}
	return JSON.parse(fs.readFileSync(REPORT, 'utf8'))
}

/**
 * Ошибки типов, разложенные по задачам. Нужны для паков, где задание — сам тип:
 * там проверка не в рантайме, а в `tsc`.
 */
function collectTypeErrors(packs) {
	const byTask = new Map()
	const tsconfig = path.join(ROOT, 'tsconfig.app.json')
	if (!fs.existsSync(tsconfig)) return byTask

	const tscBin = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
	if (!fs.existsSync(tscBin)) return byTask

	const result = spawnSync(
		process.execPath,
		[tscBin, '-p', tsconfig, '--noEmit', '--pretty', 'false'],
		{
			cwd: ROOT,
			encoding: 'utf8',
		},
	)
	const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`

	for (const line of output.split(/\r?\n/)) {
		const match = line.match(/^(.+?)\((\d+),\d+\): error (TS\d+): (.+)$/)
		if (!match) continue
		const [, file, lineNumber, code, message] = match
		const absolute = path.resolve(ROOT, file)

		for (const pack of packs) {
			for (const task of pack.tasks.values()) {
				if (path.resolve(task.file ?? pack.tasksFile) !== absolute) continue
				if (Number(lineNumber) < task.startLine || Number(lineNumber) > task.endLine) continue
				const list = byTask.get(task.id) ?? []
				list.push(`${code}: ${message}`)
				byTask.set(task.id, list)
			}
		}
	}
	return byTask
}

/** ancestorTitles[0] === 'BAS-07 countdown' → 'BAS-07' */
function idOf(assertion) {
	const source = assertion.ancestorTitles?.[0] ?? assertion.fullName ?? ''
	return source.match(/^[A-Z]{2,4}-\d+/)?.[0] ?? null
}

function collect(report) {
	const byTask = new Map()
	for (const file of report.testResults ?? []) {
		for (const assertion of file.assertionResults ?? []) {
			const id = idOf(assertion)
			if (!id) continue
			const entry = byTask.get(id) ?? { total: 0, passed: 0, failures: [] }
			entry.total += 1
			if (assertion.status === 'passed') entry.passed += 1
			else entry.failures.push(assertion.title)
			byTask.set(id, entry)
		}
	}
	return byTask
}

/**
 * Файлы тестов, которые не запустились вовсе: ошибка импорта или исключение
 * на уровне модуля. У них ноль результатов, и без этой проверки пак выглядел бы
 * полностью сданным — просто потому, что провалиться было нечему.
 */
function collectBrokenFiles(report) {
	const broken = new Set()
	for (const file of report.testResults ?? []) {
		const assertions = file.assertionResults ?? []
		if (assertions.length === 0 && file.status !== 'passed') broken.add(path.resolve(file.name))
	}
	return broken
}

/** Время последней правки любого файла задач. По нему видно, устарел ли прогресс. */
export function lastTaskEdit(packs) {
	let newest = 0
	for (const pack of packs) {
		for (const task of pack.tasks.values()) {
			const file = task.file ?? pack.tasksFile
			if (!file || !fs.existsSync(file)) continue
			const mtime = fs.statSync(file).mtimeMs
			if (mtime > newest) newest = mtime
		}
	}
	return newest
}

/**
 * Прогресс устарел, если файла нет, он без отметки времени
 * или хоть одна задача правилась после последнего прогона.
 */
export function isStale(packs, progress = readProgress()) {
	if (!progress?.generatedAt) return true
	return lastTaskEdit(packs) > Date.parse(progress.generatedAt)
}

/**
 * Прогнать тесты и типы, вернуть разбор по задачам и пакам.
 * Побочно пишет `.progress.json`, чтобы соседние команды не гоняли тесты заново.
 */
export function computeState(packs, { quiet = false } = {}) {
	const report = runTests({ quiet })
	const byTask = collect(report)
	const brokenFiles = collectBrokenFiles(report)
	const typeErrors = collectTypeErrors(packs)

	const state = { generatedAt: new Date().toISOString(), tasks: {}, packs: {} }
	const rows = []
	const brokenPacks = []
	let grandTotal = 0
	let grandDone = 0

	for (const pack of packs) {
		let done = 0
		const taskRows = []
		const packBroken = pack.testFile ? brokenFiles.has(path.resolve(pack.testFile)) : false
		if (packBroken) brokenPacks.push(pack.code)

		for (const task of pack.tasks.values()) {
			const stats = byTask.get(task.id)
			const types = typeErrors.get(task.id) ?? []
			// Задача сдана, когда зелены и тесты, и типы. Пак без тестов (чистые типы)
			// считается сданным по одному лишь tsc, а упавший на импорте файл тестов
			// не засчитывает ничего.
			const testsOk = stats ? stats.passed === stats.total && stats.total > 0 : null
			const solved = !packBroken && types.length === 0 && (testsOk ?? true)
			const started = stats ? stats.passed > 0 : false
			state.tasks[task.id] = solved ? 'pass' : started ? 'partial' : 'fail'
			if (solved) done += 1
			taskRows.push({ task, stats, solved, started, types })
		}

		state.packs[pack.code] = { done, total: pack.tasks.size, dir: pack.name }
		grandTotal += pack.tasks.size
		grandDone += done
		rows.push({ pack, done, taskRows })
	}

	fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, '\t'))
	return { state, rows, brokenPacks, grandDone, grandTotal }
}

/**
 * Свежий прогресс. Пересчитывает только если реально устарел —
 * иначе каждая команда гоняла бы весь набор тестов.
 */
export function ensureState(packs, { force = false, quiet = false } = {}) {
	const cached = readProgress()
	if (!force && cached && !isStale(packs, cached)) return { state: cached, recomputed: false }
	return { state: computeState(packs, { quiet }).state, recomputed: true }
}

/** Первая несданная задача в порядке «от простого к сложному». */
export function firstUnsolved(packs, state) {
	for (const pack of packs) {
		for (const task of pack.tasks.values()) {
			if (state.tasks?.[task.id] !== 'pass') return { pack, task }
		}
	}
	return null
}
