#!/usr/bin/env node
/**
 * Открыть задачу и гонять только её тесты.
 *
 *   yarn solve            первая НЕрешённая — от самых лёгких паков к сложным
 *   yarn solve BAS-07     конкретная задача
 *   yarn solve BAS        первая нерешённая внутри пака
 *   yarn solve -f         пересчитать прогресс принудительно и взять следующую
 *   yarn solve BAS-07 -n  не открывать редактор, только тесты
 *
 * Без аргумента команда сама решает, надо ли перепроверять состояние:
 * если файлы задач правились после последнего прогона — тесты прогоняются заново,
 * иначе берётся кеш из `.progress.json`. Так «следующая» всегда настоящая,
 * а не та, что была на момент последнего `yarn progress`.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { c, findPack, findTask, loadPacks, palette, ROOT } from './lib.mjs'
import { ensureState, firstUnsolved, isStale } from './state.mjs'
import { code, end, key, line, node, stars, top } from './ui.mjs'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('-')))
const args = argv.filter(a => !a.startsWith('-'))
const force = flags.has('-f') || flags.has('--fresh')

const packs = loadPacks()
if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

/** Первая несданная задача — по всему тренажёру или внутри одного пака. */
function pickUnsolved(scope) {
	const list = scope ? [scope] : packs
	if (force || isStale(list)) {
		console.log('')
		console.log(line(palette.amber('⟳ ') + palette.faint('прогресс устарел, перепроверяю...')))
	}

	const { state } = ensureState(list, { force })
	const found = firstUnsolved(list, state)

	if (!found) {
		console.log('')
		console.log(
			end(
				scope
					? palette.mint(`Пак ${scope.code} сдан полностью.`) + palette.faint('  дальше: yarn task')
					: palette.mint('Всё решено. Можешь идти на собес.'),
			),
		)
		console.log('')
		process.exit(0)
	}
	return found
}

/** Текст условия из комментария задачи, без звёздочек и обрамления. */
function condition(body) {
	const doc = body.match(/\/\*\*([\s\S]*?)\*\//)
	if (!doc) return ''
	return doc[1]
		.split('\n')
		.map(entry => entry.replace(/^\s*\*\s?/, ''))
		.join('\n')
		.trim()
}

/** Сигнатура: всё, что не комментарий. Это и есть то, что нужно заполнить. */
function signature(body) {
	return body
		.replace(/\/\*\*[\s\S]*?\*\//, '')
		.split('\n')
		.filter(entry => entry.trim() && !entry.trim().startsWith('//'))
		.join('\n')
		.trim()
}

/** Тело describe без самой обёртки — остаются только проверки. */
function checks(body) {
	const inner = body.split('\n').slice(1, -1)
	return inner
		.map(entry => entry.replace(/^\t/, ''))
		.join('\n')
		.trim()
}

const query = args[0]
let found = null
let auto = false

if (!query) {
	found = pickUnsolved(null)
	auto = true
} else {
	found = findTask(packs, query)
	if (!found) {
		// Не задача — возможно, код пака: тогда берём первую несданную внутри него.
		const pack = findPack(packs, query)
		if (pack) {
			found = pickUnsolved(pack)
			auto = true
		}
	}
}

if (!found) {
	console.log('')
	console.log(
		end(palette.rose(`Не нашла задачу «${query}».`) + palette.faint('  список: yarn task')),
	)
	console.log('')
	process.exit(1)
}

const { pack, task } = found
const file = task.file ?? pack.tasksFile
const relative = path.relative(ROOT, file).split(path.sep).join('/')
const test = pack.tests.get(task.id)

const out = ['']
out.push(top(task.id, auto ? 'следующая нерешённая' : `пак ${pack.code}`))
out.push(line(c.bold(palette.ink(task.title)) + '  ' + stars(task.stars)))
out.push(line(palette.surface(`${relative}  ·  норматив ~${pack.norm} мин на весь пак`)))
out.push(line())

out.push(node('ЧТО НАДО СДЕЛАТЬ'))
out.push(line())
for (const entry of condition(task.body).split('\n')) out.push(line(palette.ink(entry)))
out.push(line())

out.push(node('ЗАПОЛНИТЬ'))
out.push(line())
out.push(...code(signature(task.body)))
out.push(line())

if (test) {
	out.push(node('ПРИЁМКА'))
	out.push(line(palette.surface('эти проверки должны стать зелёными')))
	out.push(line())
	out.push(...code(checks(test.body)))
	out.push(line())
}

out.push(
	line(
		key('yarn task ' + task.id + ' -c') + palette.faint('  карточка в буфер, вставить в claude.ai'),
	),
)
out.push(line(key('yarn clean ' + task.id) + palette.faint('  сбросить задачу к заготовке')))
out.push(end(key('Ctrl+C') + palette.faint('  выйти')))
out.push('')

console.log(out.join('\n'))

// Открываем файл в редакторе на строке с заготовкой. Нет `code` в PATH — просто пропускаем.
// На Windows code — это .cmd, а node с 20.12 отказывается спавнить .cmd без shell и кидает
// EINVAL синхронно, мимо обработчика 'error'. Поэтому win32 идёт через shell с кавычками.
if (!flags.has('-n') && !flags.has('--no-open')) {
	const win = process.platform === 'win32'
	const target = `${file}:${task.startLine + 1}`
	const miss = () => console.log(line(palette.amber('VS Code не найден в PATH — открой файл сам')))
	try {
		const editor = win
			? spawn('code.cmd', ['-g', `"${target}"`], {
					stdio: 'ignore',
					shell: true,
					windowsHide: true,
				})
			: spawn('code', ['-g', target], { stdio: 'ignore' })
		editor.on('error', miss)
	} catch {
		miss()
	}
}

// Watch только по этой задаче.
// hideSkippedTests убирает простыню из соседних задач пака, bail=1 не повторяет
// одну и ту же ошибку трижды: правишь код — проверки идут заново с первой.
const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
const child = spawn(
	process.execPath,
	[vitest, `src/drills/${pack.name}`, '-t', task.id, '--hideSkippedTests', '--bail=1'],
	{ cwd: ROOT, stdio: 'inherit' },
)

child.on('exit', status => process.exit(status ?? 0))
