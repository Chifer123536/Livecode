#!/usr/bin/env node
/**
 * Прогресс по тренажёру. Источник истины — сами тесты, а не галочки руками.
 *
 *   yarn progress          прогнать всё и показать таблицу
 *   yarn progress ARR      только один пак
 */
import fs from 'node:fs'
import path from 'node:path'
import { bar, c, loadPacks, padEnd, palette, percentOf, ROOT } from './lib.mjs'
import { computeState } from './state.mjs'
import { end, key, line, mark, node, stars, top } from './ui.mjs'

const MD = path.join(ROOT, 'PROGRESS.md')

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const filter = args[0]?.toUpperCase() ?? null

function main() {
	const packs = loadPacks()
	const { rows, brokenPacks, grandDone, grandTotal } = computeState(packs)

	const md = [
		'# Прогресс',
		'',
		`Обновлено: ${new Date().toLocaleString('ru-RU')}`,
		'',
		'> Файл генерируется командой `yarn progress`. Руками не править.',
		'',
	]

	const out = ['']
	out.push(top('ПРОГРЕСС', 'livecode drills'))
	out.push(line())

	let currentLevel = null

	for (const { pack, done, taskRows } of rows) {
		const total = pack.tasks.size

		if (pack.level !== currentLevel) {
			currentLevel = pack.level
			out.push(line(palette.surface(`уровень ${currentLevel}`)))
		}

		const percent = percentOf(done, total)
		const counter =
			done === total
				? palette.mint(padEnd(`${done}/${total}`, 8))
				: palette.faint(padEnd(`${done}/${total}`, 8))

		out.push(
			line(
				palette.accent(padEnd(pack.code, 6)) +
					palette.ink(padEnd(pack.title, 26)) +
					bar(done, total, 22) +
					'  ' +
					counter +
					(percent === 100 ? palette.mint('✓') : ''),
			),
		)

		if (filter && pack.code.toUpperCase() === filter) {
			for (const { task, stats, solved, types } of taskRows) {
				const extra =
					stats && !solved ? palette.surface(` ${stats.passed}/${stats.total} тестов`) : ''
				const typeNote = types.length ? palette.rose(` типы: ${types.length}`) : ''
				out.push(
					line(
						'  ' +
							mark(solved ? 'pass' : stats?.passed > 0 ? 'partial' : 'fail') +
							'  ' +
							palette.faint(padEnd(task.id, 9)) +
							stars(task.stars) +
							padEnd('', 5 - (task.stars?.length ?? 0)) +
							palette.ink(task.title) +
							extra +
							typeNote,
					),
				)
			}
		}

		md.push(`## ${pack.code} · ${pack.title} — ${done}/${total}`, '')
		for (const { task, solved } of taskRows) {
			md.push(`- [${solved ? 'x' : ' '}] \`${task.id}\` ${task.title} ${task.stars}`)
		}
		md.push('')
	}

	const percent = percentOf(grandDone, grandTotal)
	out.push(line())
	out.push(
		node(
			`ИТОГО  ${c.bold(palette.ink(String(grandDone)))}${palette.faint(`/${grandTotal}`)}  ${palette.faint(`${percent}%`)}`,
		),
	)
	out.push(line(bar(grandDone, grandTotal, 46)))

	if (brokenPacks.length > 0) {
		out.push(line())
		out.push(
			line(palette.rose('Файл тестов не запустился: ') + palette.ink(brokenPacks.join(', '))),
		)
		out.push(
			line(
				palette.surface('Скорее всего, задача вызывается прямо при импорте. Смотри `yarn test`.'),
			),
		)
	}

	const nextTask = rows.flatMap(entry => entry.taskRows).find(entry => !entry.solved)
	out.push(line())
	if (nextTask) {
		out.push(
			line(
				palette.faint('следующая  ') +
					palette.accent(nextTask.task.id) +
					palette.ink(`  ${nextTask.task.title}`),
			),
		)
		out.push(end(key('yarn solve') + palette.faint('  открыть её и гонять только её тесты')))
	} else {
		out.push(end(palette.mint('Всё зелёное. Иди на собес.')))
	}
	out.push('')

	console.log(out.join('\n'))

	md.unshift('')
	md.splice(5, 0, `**Итого: ${grandDone} / ${grandTotal} (${percent}%)**`, '')
	fs.writeFileSync(MD, md.join('\n'))
}

main()
