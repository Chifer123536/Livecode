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

/** Текст условия из комментария задачи, без звёздочек и обрамления. */
function condition(body) {
	const doc = body.match(/\/\*\*([\s\S]*?)\*\//)
	if (!doc) return ''
	return doc[1]
		.split('\n')
		.map(line => line.replace(/^\s*\*\s?/, ''))
		.join('\n')
		.trim()
}

/** Сигнатура: всё, что не комментарий. Это и есть то, что нужно заполнить. */
function signature(body) {
	return body
		.replace(/\/\*\*[\s\S]*?\*\//, '')
		.split('\n')
		.filter(line => line.trim() && !line.trim().startsWith('//'))
		.join('\n')
		.trim()
}

/** Тело describe без самой обёртки — остаются только проверки. */
function checks(body) {
	const lines = body.split('\n')
	const inner = lines.slice(1, -1)
	return inner.map(line => line.replace(/^\t/, '')).join('\n').trim()
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
const test = pack.tests.get(task.id)

console.log()
console.log(`  ${c.bold(task.id)} · ${c.bold(task.title)} ${c.gray(task.stars)}`)
console.log(c.gray(`  ${relative}  ·  пак ${pack.code}, норматив ~${pack.norm} мин на весь пак`))

console.log()
console.log(c.cyan('  ЧТО НАДО СДЕЛАТЬ'))
for (const line of condition(task.body).split('\n')) console.log('  ' + line)

console.log()
console.log(c.cyan('  ЗАПОЛНИТЬ'))
for (const line of signature(task.body).split('\n')) console.log(c.gray('  ' + line))

if (test) {
	console.log()
	console.log(c.cyan('  ПРИЁМКА') + c.gray('  — эти проверки должны стать зелёными'))
	for (const line of checks(test.body).split('\n')) console.log(c.gray('  ' + line))
}

console.log()
console.log(c.gray(`  застрял → yarn task ${task.id} -c   (карточка в буфер, вставить в claude.ai)`))
console.log(c.gray('  выйти   → Ctrl+C'))
console.log()

// Открываем файл в редакторе на строке с заготовкой. Нет `code` в PATH — просто пропускаем.
// Без shell: иначе node ругается предупреждением про неэкранированные аргументы.
if (!flags.has('-n') && !flags.has('--no-open')) {
	const editor = spawn(process.platform === 'win32' ? 'code.cmd' : 'code', ['-g', `${file}:${task.startLine + 1}`], {
		stdio: 'ignore',
	})
	editor.on('error', () => console.log(c.yellow('  (VS Code не найден в PATH — открой файл сам)')))
}

// Watch только по этой задаче.
// hideSkippedTests убирает простыню из соседних задач пака, bail=1 не повторяет
// одну и ту же ошибку трижды: правишь код — проверки идут заново с первой.
const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
const child = spawn(
	process.execPath,
	[vitest, `src/drills/${pack.name}`, '-t', task.id, '--hideSkippedTests', '--bail=1'],
	{ cwd: ROOT, stdio: 'inherit' }
)

child.on('exit', code => process.exit(code ?? 0))
