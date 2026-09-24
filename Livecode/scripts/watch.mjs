#!/usr/bin/env node
/**
 * Тесты одной задачи в watch-режиме: правишь файл — проверки идут заново.
 * Нужен тем, кому привычнее держать тесты запущенными; обычный путь — `yarn ok`.
 *
 *   yarn watch           текущая задача
 *   yarn watch BAS-07    конкретная
 *   yarn watch BAS       весь пак
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import {
	c,
	findPack,
	findTask,
	firstUnsolved,
	loadPacks,
	palette,
	readCurrent,
	readProgress,
	ROOT,
	writeCurrent,
} from './lib.mjs'
import { end, hint, line, top } from './ui.mjs'

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const packs = loadPacks()

if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

const query = args[0]
const found =
	(query && findTask(packs, query)) ||
	(!query &&
		((readCurrent() && findTask(packs, readCurrent())) || firstUnsolved(packs, readProgress())))
const pack = found ? found.pack : query ? findPack(packs, query) : null

if (!found && !pack) {
	console.log('')
	console.log(
		end(palette.rose(`Не нашла «${query ?? ''}».`) + palette.faint('  список: yarn task')),
	)
	console.log('')
	process.exit(0)
}

const scope = `src/drills/${(found?.pack ?? pack).name}`
const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')
// --watch явно: в консоли меню вывод идёт в трубу, и без флага vitest прогнал бы один раз.
const args2 = [vitest, scope, '--watch', '--hideSkippedTests']

if (found) {
	writeCurrent(found.task.id)
	// Якорь не даёт BAS-1 утащить за собой BAS-10..BAS-19.
	args2.push('-t', `^${found.task.id}\\b`, '--bail=1')
}

console.log('')
console.log(top('WATCH', found ? `${found.task.id} · ${found.task.title}` : `пак ${pack.code}`))
console.log(line(palette.surface('правишь файл — проверки идут заново')))
console.log(end(hint('Ctrl+C', 'выйти')))
console.log('')

const child = spawn(process.execPath, args2, { cwd: ROOT, stdio: 'inherit' })
child.on('exit', status => process.exit(status ?? 0))
