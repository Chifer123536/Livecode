#!/usr/bin/env node
/**
 * Прогресс по тренажёру. Источник истины — сами тесты, а не галочки руками.
 *
 *   yarn progress          прогнать всё и показать таблицу
 *   yarn progress ARR      только один пак
 */
import fs from 'node:fs'
import path from 'node:path'
import { bar, c, loadPacks, padEnd, ROOT } from './lib.mjs'
import { computeState } from './state.mjs'

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

	console.log()
	console.log(c.bold('  ПРОГРЕСС ПО ТРЕНАЖЁРУ'))
	console.log(c.gray('  ' + '─'.repeat(82)))

	for (const { pack, done, taskRows } of rows) {
		const total = pack.tasks.size
		console.log(
			`  ${c.cyan(padEnd(pack.code, 5))}${padEnd(pack.title, 26)}${bar(done, total, 20)} ${c.gray(padEnd(`${done}/${total}`, 8))}`,
		)

		if (filter && pack.code.toUpperCase() === filter) {
			for (const { task, stats, solved, started, types } of taskRows) {
				const mark = solved ? c.green('✔') : started ? c.yellow('◐') : c.red('✗')
				const extra = stats && !solved ? c.gray(` (${stats.passed}/${stats.total} тестов)`) : ''
				const typeNote = types.length ? c.red(` [типы: ${types.length}]`) : ''
				console.log(`       ${mark} ${c.gray(padEnd(task.id, 9))}${task.title}${extra}${typeNote}`)
			}
		}

		md.push(`## ${pack.code} · ${pack.title} — ${done}/${total}`, '')
		for (const { task, solved } of taskRows)
			md.push(`- [${solved ? 'x' : ' '}] \`${task.id}\` ${task.title} ${task.stars}`)
		md.push('')
	}

	console.log(c.gray('  ' + '─'.repeat(82)))
	console.log(
		`  ${c.bold('ИТОГО')}  ${bar(grandDone, grandTotal, 40)}  ${c.bold(`${grandDone}/${grandTotal}`)} (${Math.round((grandDone / Math.max(1, grandTotal)) * 100)}%)`,
	)

	if (brokenPacks.length > 0) {
		console.log()
		console.log(c.red(`  Файл тестов не запустился: ${brokenPacks.join(', ')}`))
		console.log(c.gray('  Скорее всего, задача вызывается прямо при импорте. Смотри `yarn test`.'))
	}

	const nextTask = rows.flatMap(r => r.taskRows).find(t => !t.solved)
	if (nextTask) {
		console.log()
		console.log(`  Следующая: ${c.cyan(nextTask.task.id)} — ${nextTask.task.title}`)
		console.log(c.gray('  yarn solve            — открыть её и гонять только её тесты'))
		console.log(
			c.gray(`  yarn task ${nextTask.task.id} -c   (карточка в буфер, чтобы спросить Клода)`),
		)
	} else {
		console.log()
		console.log(c.green('  Всё зелёное. Иди на собес.'))
	}
	console.log()

	md.unshift('')
	md.splice(
		5,
		0,
		`**Итого: ${grandDone} / ${grandTotal} (${Math.round((grandDone / Math.max(1, grandTotal)) * 100)}%)**`,
		'',
	)
	fs.writeFileSync(MD, md.join('\n'))
}

main()
