#!/usr/bin/env node
/**
 * Разбор решения: из чего состоит, как выполняется по шагам на живом примере, края.
 *
 *   yarn how              текущая задача (та, что открывал последней)
 *   yarn how BAS-07       конкретная задача
 *
 * Показывает эталон — открывать после своей попытки.
 */
import {
	c,
	findTask,
	firstUnsolved,
	loadPacks,
	palette,
	readCurrent,
	readProgress,
	termWidth,
} from './lib.mjs'
import { end, hint } from './ui.mjs'
import { loadWalkthroughs, renderWalkthrough } from './walkthrough.mjs'

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const packs = loadPacks()

if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

const query = args[0]
const current = readCurrent()
const found = query
	? findTask(packs, query)
	: (current && findTask(packs, current)) || firstUnsolved(packs, readProgress())

if (!found) {
	console.log('')
	console.log(
		end(palette.rose(`Не нашла задачу «${query ?? ''}».`) + palette.faint('  список: yarn task')),
	)
	console.log('')
	process.exit(0)
}

const { pack, task } = found
const entry = loadWalkthroughs(pack).get(task.id)
const lines = renderWalkthrough({ pack, task, entry, width: termWidth() })

console.log('')
console.log(lines.join('\n'))
console.log(end(hint(`yarn ok ${task.id}`, 'проверить своё решение')))
console.log('')
