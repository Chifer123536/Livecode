#!/usr/bin/env node
/**
 * Проверка задачи. Гоняет только то, что попросили, и печатает результат человеку.
 *
 *   yarn ok              текущая задача (та, что открывал последней)
 *   yarn ok BAS-07       конкретная задача
 *   yarn ok BAS          весь пак
 *   yarn ok --all        весь тренажёр
 *   yarn ok BAS -v       показать в списке и зелёные задачи
 *
 * Результат сразу вписывается в прогресс, поэтому «следующая нерешённая»
 * знает правду без полного прогона тестов.
 */
import {
	allTasks,
	c,
	findPack,
	findTask,
	firstUnsolved,
	loadPacks,
	palette,
	readCurrent,
	readProgress,
	termWidth,
	writeCurrent,
} from './lib.mjs'
import { renderManyResults, renderRunError, renderTaskResult } from './report.mjs'
import { checkTargets } from './state.mjs'
import { end, hint, line, spinner } from './ui.mjs'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('-')))
const args = argv.filter(a => !a.startsWith('-'))
const verbose = flags.has('-v') || flags.has('--verbose')

const packs = loadPacks()
if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

/** Что проверяем: одну задачу, пак или всё. */
function resolveTarget() {
	if (flags.has('--all') || flags.has('-a')) return { kind: 'all', targets: allTasks(packs) }

	const query = args[0]
	if (!query) {
		const current = readCurrent()
		const found = (current && findTask(packs, current)) || firstUnsolved(packs, readProgress())
		return found ? { kind: 'task', targets: [found] } : { kind: 'done' }
	}

	const task = findTask(packs, query)
	if (task) return { kind: 'task', targets: [task] }

	const pack = findPack(packs, query)
	if (pack) {
		return {
			kind: 'pack',
			pack,
			targets: [...pack.tasks.values()].map(entry => ({ pack, task: entry })),
		}
	}
	return { kind: 'unknown', query }
}

const target = resolveTarget()

if (target.kind === 'unknown' || target.kind === 'done') {
	console.log('')
	console.log(
		end(
			target.kind === 'done'
				? palette.mint('Всё решено. Можешь идти на собес.')
				: palette.rose(`Не нашла «${target.query}».`) + palette.faint('  список: yarn task'),
		),
	)
	console.log('')
	process.exit(0)
}

const single = target.kind === 'task'
const spin = spinner(
	target.kind === 'all'
		? 'проверяю весь тренажёр — это долго'
		: single
			? `проверяю ${target.targets[0].task.id}`
			: `проверяю пак ${target.pack.code}`,
)

const { results, error, elapsed, progress } = await checkTargets(packs, target.targets, {
	whole: target.kind === 'all',
})
spin.stop()
if (single) writeCurrent(target.targets[0].task.id)

const out = ['']

if (error) {
	out.push(...renderRunError(error))
	out.push(end(hint('yarn test', 'посмотреть полный вывод vitest')))
} else if (single) {
	const [result] = results
	out.push(...renderTaskResult(result, { elapsed }))
	out.push(line())
	if (result.status === 'pass') {
		const next = firstUnsolved(packs, progress)
		out.push(line(hint(`yarn how ${result.task.id}`, 'разбор эталона по шагам')))
		out.push(
			end(
				next
					? hint('yarn go', `дальше — ${next.task.id} ${next.task.title}`)
					: palette.mint('Всё решено. Можешь идти на собес.'),
			),
		)
	} else {
		out.push(
			end(
				hint('yarn ok', 'ещё раз') +
					palette.surface('   ·   ') +
					hint(`yarn how ${result.task.id}`, 'разбор по шагам'),
			),
		)
	}
} else {
	out.push(
		...renderManyResults(results, {
			packs,
			scope: target.kind === 'pack' ? target.pack : null,
			elapsed,
			verbose,
			width: termWidth(),
		}),
	)
	out.push(line())
	const failed = results.find(result => result.status !== 'pass')
	if (!failed) {
		out.push(
			end(
				palette.mint(target.kind === 'all' ? 'Всё зелёное. Иди на собес.' : 'Пак сдан полностью.'),
			),
		)
	} else {
		out.push(
			line(
				palette.faint('ближайшая незакрытая  ') +
					palette.accent(failed.task.id) +
					palette.ink('  ' + failed.task.title),
			),
		)
		out.push(
			end(
				hint(`yarn go ${failed.task.id}`, 'открыть') +
					palette.surface('   ·   ') +
					hint(`yarn ok ${failed.task.id}`, 'проверить точечно'),
			),
		)
	}
}

out.push('')
console.log(out.join('\n'))
