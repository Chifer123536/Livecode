#!/usr/bin/env node
/**
 * Открыть задачу и гонять только её тесты.
 *
 *   yarn solve            следующая нерешённая
 *   yarn solve BAS-07     конкретная задача
 *   yarn solve BAS-07 -n  не открывать редактор, только тесты
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { c, findTask, loadPacks, readProgress, ROOT } from './lib.mjs'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('-')))
const args = argv.filter(a => !a.startsWith('-'))

const packs = loadPacks()
if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

/** Без аргумента берём первую нерешённую по последнему прогону `yarn progress`. */
function nextId() {
	const progress = readProgress()
	const all = packs.flatMap(pack => [...pack.tasks.keys()])
	if (!progress) return all[0]
	return all.find(id => progress.tasks?.[id] !== 'pass') ?? all[0]
}

const query = args[0] ?? nextId()
const found = findTask(packs, query)

if (!found) {
	console.log(c.red(`Не нашла задачу «${query}». Список: yarn task`))
	process.exit(1)
}

const { pack, task } = found
const file = task.file ?? pack.tasksFile
const relative = path.relative(ROOT, file).replace(/\\/g, '/')

console.log()
console.log(`  ${c.bold(task.id)} · ${task.title} ${c.gray(task.stars)}`)
console.log(c.gray(`  ${relative}`))
console.log(c.gray(`  разбор в Клоде: yarn task ${task.id} -c`))
console.log()

// Открываем файл в редакторе на строке с заготовкой. Нет `code` в PATH — просто пропускаем.
if (!flags.has('-n') && !flags.has('--no-open')) {
	const editor = spawn('code', ['-g', `${file}:${task.startLine + 1}`], {
		stdio: 'ignore',
		shell: process.platform === 'win32',
	})
	editor.on('error', () => console.log(c.yellow('  (VS Code не найден в PATH — открой файл сам)')))
}

// Watch только по этой задаче: файл пака + фильтр по имени describe.
const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
const child = spawn(process.execPath, [vitest, `src/drills/${pack.name}`, '-t', task.id], {
	cwd: ROOT,
	stdio: 'inherit',
})

child.on('exit', code => process.exit(code ?? 0))
