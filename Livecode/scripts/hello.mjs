#!/usr/bin/env node
/**
 * Шпаргалка при входе в папку тренажёра: где ты сейчас и четыре главные команды.
 * Печатается хуком из scripts/shell/livecode.ps1, вручную — `node scripts/hello.mjs`.
 * Должна быть мгновенной: тестов не запускает, берёт всё из прогресса.
 */
import {
	bar,
	c,
	findTask,
	firstUnsolved,
	loadPacks,
	palette,
	percentOf,
	readCurrent,
	readProgress,
	statusOf,
} from './lib.mjs'
import { stateLine } from './card.mjs'
import { end, hint, line, row, stars, GUTTER } from './ui.mjs'

const packs = loadPacks()
const progress = readProgress()

const total = packs.reduce((sum, pack) => sum + pack.tasks.size, 0)
const done = packs.reduce(
	(sum, pack) =>
		sum + [...pack.tasks.keys()].filter(id => statusOf(progress, id) === 'pass').length,
	0,
)

// Текущая задача интересна, пока не сдана. Сдана — показываем, что дальше.
const current = readCurrent()
const open = current && statusOf(progress, current) !== 'pass' ? findTask(packs, current) : null
const focus = open || firstUnsolved(packs, progress)

const out = ['']
out.push(
	row(
		GUTTER.top,
		c.bold(palette.accent('ТРЕНАЖЁР')) +
			'   ' +
			bar(done, total, 20) +
			'  ' +
			c.bold(palette.ink(`${done}/${total}`)) +
			palette.faint(`  ${percentOf(done, total)}%`),
	),
)

if (focus) {
	const { pack, task } = focus
	out.push(
		line(
			palette.faint(open ? 'сейчас  ' : 'дальше  ') +
				c.bold(palette.accent(task.id)) +
				palette.ink(`  ${task.title}  `) +
				stars(task.stars) +
				palette.surface('   ') +
				stateLine(progress, pack, task),
		),
	)
}

out.push(line())
out.push(line(hint('yarn menu', 'всё то же самое стрелками')))
out.push(line(hint('yarn go  ', 'открыть задачу в VS Code')))
out.push(line(hint('yarn ok  ', 'проверить, когда написал')))
out.push(line(hint('yarn how ', 'разбор решения по шагам')))
out.push(line())
out.push(
	end(
		palette.faint('Tab дополняет команды и коды задач: ') +
			palette.accent('yarn go BAS') +
			palette.surface('⇥'),
	),
)
out.push('')

console.log(out.join('\n'))
