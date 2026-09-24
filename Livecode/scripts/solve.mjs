#!/usr/bin/env node
/**
 * Открыть задачу: показать условие, приёмку и положить курсор в редактор.
 * Тесты здесь НЕ запускаются — проверка это отдельная команда `yarn ok`.
 *
 *   yarn go                 следующая нерешённая — от лёгких паков к сложным
 *   yarn go BAS-07          конкретная задача
 *   yarn go BAS             первая нерешённая внутри пака
 *   yarn go -n              не открывать редактор
 *   yarn go BAS-07 --check  открыть и сразу проверить
 *
 * «Следующая» берётся из прогресса, который ведут проверки. Полного прогона тут нет:
 * открытие задачи должно быть мгновенным.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import {
	c,
	fileOf,
	findPack,
	findTask,
	firstUnsolved,
	loadPacks,
	palette,
	readProgress,
	ROOT,
	writeCurrent,
} from './lib.mjs'
import { renderCard } from './card.mjs'
import { openInEditor } from './editor.mjs'
import { end, hint, line, rule } from './ui.mjs'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('-')))
const args = argv.filter(a => !a.startsWith('-'))

const packs = loadPacks()
if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

const progress = readProgress()

/** Первая несданная — по всему тренажёру или внутри одного пака. */
function pickUnsolved(scope) {
	const found = firstUnsolved(scope ? [scope] : packs, progress)
	if (found) return found

	console.log('')
	console.log(
		end(
			scope
				? palette.mint(`Пак ${scope.code} сдан полностью.`) +
						palette.faint('  дальше: yarn go — следующий пак')
				: palette.mint('Всё решено. Можешь идти на собес.'),
		),
	)
	console.log('')
	process.exit(0)
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
	// Опечатка в аргументе — не повод ронять команду: yarn тогда добавляет свой блок ошибки.
	process.exit(0)
}

const { pack, task } = found
writeCurrent(task.id)

const out = ['']
out.push(
	...renderCard({
		pack,
		task,
		progress,
		subtitle: auto ? 'следующая нерешённая' : undefined,
	}),
)
out.push(rule())
out.push(line(hint('yarn ok', 'проверить, когда напишешь')))
out.push(line(hint('yarn how', 'разбор решения по шагам — после своей попытки')))
out.push(line(hint(`yarn clean ${task.id}`, 'сбросить задачу к заготовке')))
out.push(end(hint('yarn watch', 'гонять её тесты в фоне, если так привычнее')))
out.push('')
console.log(out.join('\n'))

if (!flags.has('-n') && !flags.has('--no-open')) {
	if (!openInEditor(fileOf(pack, task), task.startLine + 1)) {
		console.log(line(palette.amber('VS Code не найден — открой файл сам')))
	}
}

// Проверка сразу после открытия — только по явной просьбе.
if (flags.has('--check')) {
	spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check.mjs'), task.id], {
		cwd: ROOT,
		stdio: 'inherit',
	})
}
