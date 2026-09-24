#!/usr/bin/env node
/**
 * Контрольный прогон: все тесты и типы разом, таблица по пакам и перезапись PROGRESS.md.
 * Долго — минуту. Каждый день это не нужно: точечная `yarn ok` ведёт прогресс сама.
 *
 *   yarn progress          прогнать всё и показать таблицу
 *   yarn progress ARR      то же, но с разбивкой по задачам пака
 */
import fs from 'node:fs'
import path from 'node:path'
import { bar, c, loadPacks, padEnd, palette, percentOf, ROOT } from './lib.mjs'
import { computeAll } from './state.mjs'
import { cell, end, hint, line, mark, node, rule, spinner, starsCell, top } from './ui.mjs'

const MD = path.join(ROOT, 'PROGRESS.md')

const args = process.argv.slice(2).filter(a => !a.startsWith('-'))
const filter = args[0]?.toUpperCase() ?? null

const packs = loadPacks()
if (packs.length === 0) {
	console.log(c.red('Паки не найдены.'))
	process.exit(1)
}

const spin = spinner('гоняю все тесты и типы — это минута')
const { results, brokenPacks, grandDone, grandTotal } = await computeAll(packs)
spin.stop()

// Результаты сгруппированы по пакам в порядке прохождения.
const byPack = new Map()
for (const result of results) {
	const list = byPack.get(result.pack.code) ?? []
	list.push(result)
	byPack.set(result.pack.code, list)
}

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

for (const pack of packs) {
	const rows = byPack.get(pack.code) ?? []
	const done = rows.filter(result => result.status === 'pass').length
	const total = pack.tasks.size

	if (pack.level !== currentLevel) {
		currentLevel = pack.level
		out.push(line(palette.surface(`уровень ${currentLevel}`)))
	}

	const counter =
		done === total
			? palette.mint(padEnd(`${done}/${total}`, 8))
			: palette.faint(padEnd(`${done}/${total}`, 8))

	out.push(
		line(
			palette.accent(padEnd(pack.code, 6)) +
				palette.ink(cell(pack.title, 26)) +
				bar(done, total, 22) +
				'  ' +
				counter +
				(done === total ? palette.mint('✓') : ''),
		),
	)

	if (filter && pack.code.toUpperCase() === filter) {
		for (const result of rows) {
			const extra =
				result.stats && result.status !== 'pass'
					? palette.surface(` ${result.stats.passed}/${result.stats.total} тестов`)
					: ''
			const typeNote = result.typeErrors.length
				? palette.rose(` типы: ${result.typeErrors.length}`)
				: ''
			out.push(
				line(
					'  ' +
						mark(result.status) +
						'  ' +
						palette.faint(padEnd(result.task.id, 9)) +
						starsCell(result.task.stars) +
						palette.ink(result.task.title) +
						extra +
						typeNote,
				),
			)
		}
	}

	md.push(`## ${pack.code} · ${pack.title} — ${done}/${total}`, '')
	for (const result of rows) {
		md.push(
			`- [${result.status === 'pass' ? 'x' : ' '}] \`${result.task.id}\` ${result.task.title} ${result.task.stars}`,
		)
	}
	md.push('')
}

const percent = percentOf(grandDone, grandTotal)
out.push(line())
out.push(rule())
out.push(
	node(
		`ИТОГО  ${c.bold(palette.ink(String(grandDone)))}${palette.faint(`/${grandTotal}`)}  ${palette.faint(`${percent}%`)}`,
	),
)
out.push(line(bar(grandDone, grandTotal, 46)))

if (brokenPacks.length > 0) {
	out.push(line())
	out.push(
		line(palette.rose('Тесты не запустились в паках: ') + palette.ink(brokenPacks.join(', '))),
	)
	out.push(
		line(palette.surface('Скорее всего, задача вызывается прямо при импорте. Смотри `yarn test`.')),
	)
}

const next = results.find(result => result.status !== 'pass')
out.push(line())
if (next) {
	out.push(
		line(
			palette.faint('следующая  ') +
				palette.accent(next.task.id) +
				palette.ink(`  ${next.task.title}`),
		),
	)
	out.push(
		end(hint('yarn go', 'открыть её') + palette.surface('   ·   ') + hint('yarn ok', 'проверить')),
	)
} else {
	out.push(end(palette.mint('Всё зелёное. Иди на собес.')))
}
out.push('')

console.log(out.join('\n'))

md.unshift('')
md.splice(5, 0, `**Итого: ${grandDone} / ${grandTotal} (${percent}%)**`, '')
fs.writeFileSync(MD, md.join('\n'))
