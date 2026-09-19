#!/usr/bin/env node
/**
 * Прогресс по тренажёру. Источник истины — сами тесты, а не галочки руками.
 *
 *   yarn progress          прогнать всё и показать таблицу
 *   yarn progress ARR      только один пак
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { bar, c, loadPacks, padEnd, PROGRESS_FILE, ROOT } from './lib.mjs'

const REPORT = path.join(ROOT, '.vitest-report.json')
const MD = path.join(ROOT, 'PROGRESS.md')

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const filter = args[0]?.toUpperCase() ?? null

function runTests() {
	process.stdout.write(c.gray('  гоняю тесты...'))
	const vitestBin = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
	const result = spawnSync(
		process.execPath,
		[vitestBin, 'run', '--reporter=json', `--outputFile=${REPORT}`, '--silent'],
		{ cwd: ROOT, encoding: 'utf8' }
	)
	process.stdout.write('\r' + ' '.repeat(30) + '\r')

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
 * Возвращает Map<taskId, string[]>.
 */
function collectTypeErrors(packs) {
	const byTask = new Map()
	const tsconfig = path.join(ROOT, 'tsconfig.app.json')
	if (!fs.existsSync(tsconfig)) return byTask

	const tscBin = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
	if (!fs.existsSync(tscBin)) return byTask

	const result = spawnSync(process.execPath, [tscBin, '-p', tsconfig, '--noEmit', '--pretty', 'false'], {
		cwd: ROOT,
		encoding: 'utf8',
	})
	const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`

	for (const line of output.split(/\r?\n/)) {
		const match = line.match(/^(.+?)\((\d+),\d+\): error (TS\d+): (.+)$/)
		if (!match) continue
		const [, file, lineNumber, code, message] = match
		const absolute = path.resolve(ROOT, file)

		for (const pack of packs) {
			if (pack.tasksFile !== absolute) continue
			for (const task of pack.tasks.values()) {
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

function main() {
	const packs = loadPacks()
	const report = runTests()
	const byTask = collect(report)
	const brokenFiles = collectBrokenFiles(report)
	const typeErrors = collectTypeErrors(packs)

	const state = { generatedAt: new Date().toISOString(), tasks: {}, packs: {} }
	const md = ['# Прогресс', '', `Обновлено: ${new Date().toLocaleString('ru-RU')}`, '', '> Файл генерируется командой `yarn progress`. Руками не править.', '']

	let grandTotal = 0
	let grandDone = 0
	const rows = []

	const brokenPacks = []

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

	console.log()
	console.log(c.bold('  ПРОГРЕСС ПО ТРЕНАЖЁРУ'))
	console.log(c.gray('  ' + '─'.repeat(82)))

	for (const { pack, done, taskRows } of rows) {
		const total = pack.tasks.size
		const head = `  ${c.cyan(padEnd(pack.code, 5))}${padEnd(pack.title, 26)}${bar(done, total, 20)} ${c.gray(padEnd(`${done}/${total}`, 8))}`
		console.log(head)

		if (filter && pack.code.toUpperCase() === filter) {
			for (const { task, stats, solved, started, types } of taskRows) {
				const mark = solved ? c.green('✔') : started ? c.yellow('◐') : c.red('✗')
				const extra = stats && !solved ? c.gray(` (${stats.passed}/${stats.total} тестов)`) : ''
				const typeNote = types.length ? c.red(` [типы: ${types.length}]`) : ''
				console.log(`       ${mark} ${c.gray(padEnd(task.id, 9))}${task.title}${extra}${typeNote}`)
			}
		}

		md.push(`## ${pack.code} · ${pack.title} — ${done}/${total}`, '')
		for (const { task, solved } of taskRows) md.push(`- [${solved ? 'x' : ' '}] \`${task.id}\` ${task.title} ${task.stars}`)
		md.push('')
	}

	console.log(c.gray('  ' + '─'.repeat(82)))
	console.log(`  ${c.bold('ИТОГО')}  ${bar(grandDone, grandTotal, 40)}  ${c.bold(`${grandDone}/${grandTotal}`)} (${Math.round((grandDone / Math.max(1, grandTotal)) * 100)}%)`)

	if (brokenPacks.length > 0) {
		console.log()
		console.log(c.red(`  Файл тестов не запустился: ${brokenPacks.join(', ')}`))
		console.log(c.gray('  Скорее всего, задача вызывается прямо при импорте. Смотри `yarn test`.'))
	}

	const nextTask = rows.flatMap(r => r.taskRows).find(t => !t.solved)
	if (nextTask) {
		console.log()
		console.log(`  Следующая: ${c.cyan(nextTask.task.id)} — ${nextTask.task.title}`)
		console.log(c.gray(`  yarn task ${nextTask.task.id} -c   (карточка в буфер, чтобы спросить Клода)`))
	} else {
		console.log()
		console.log(c.green('  Всё зелёное. Иди на собес.'))
	}
	console.log()

	md.unshift('')
	md.splice(5, 0, `**Итого: ${grandDone} / ${grandTotal} (${Math.round((grandDone / Math.max(1, grandTotal)) * 100)}%)**`, '')
	fs.writeFileSync(MD, md.join('\n'))
	fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, '\t'))
}

main()
