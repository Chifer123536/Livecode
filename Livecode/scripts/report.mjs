/**
 * Отчёт о проверке строками для терминала. Общий для `yarn ok` и меню.
 */
import { bar, c, fileOf, padEnd, palette, percentOf, relativePath } from './lib.mjs'
import { cell, line, mark, rule, stars, starsCell, top } from './ui.mjs'

/** Итоговая плашка: крупно и одним словом, дальше цифры. */
export function verdict(status, detail) {
	const word =
		status === 'pass'
			? c.bold(palette.mint('СДАНА'))
			: status === 'partial'
				? c.bold(palette.amber('ПОЧТИ'))
				: c.bold(palette.rose('НЕ СДАНА'))
	return word + palette.faint('   ' + detail)
}

/** Результат одной задачи: каждая проверка, ошибки с местом, типы, вердикт. */
export function renderTaskResult(result, { elapsed }) {
	const { pack, task, status, stats, typeErrors, typesOnly, missing } = result
	const file = relativePath(fileOf(pack, task))
	// Ни одна проверка не прошла, а падают все на заглушке — задачу ещё не трогали.
	const untouched = Boolean(stats && stats.passed === 0 && stats.cases.every(entry => entry.blank))

	const out = []
	out.push(top(`${task.id} · ${task.title}`, `${pack.code} · ${pack.title}`))
	out.push(line(palette.surface(file) + '   ' + stars(task.stars)))
	out.push(line())

	if (missing) {
		out.push(line(palette.rose('Тесты этой задачи не запустились.')))
		out.push(
			line(palette.surface('Скорее всего, файл пака падает на импорте — смотри `yarn test`.')),
		)
		out.push(line())
	}

	if (untouched) {
		out.push(line(palette.amber('задача ещё не начата — на месте заглушка todo()')))
		out.push(line(palette.surface('ниже то, что должно стать зелёным')))
		out.push(line())
	}

	for (const entry of stats?.cases ?? []) {
		if (untouched) {
			out.push(line(palette.surface('○') + '  ' + palette.faint(entry.title)))
			continue
		}
		if (entry.ok) {
			out.push(line(palette.mint('✓') + '  ' + palette.faint(entry.title)))
			continue
		}

		out.push(line(palette.rose('✗') + '  ' + palette.ink(entry.title)))
		if (entry.blank) {
			out.push(line('   ' + palette.surface('todo() ещё на месте')))
			continue
		}
		for (const text of String(entry.message).split('\n').slice(0, 6)) {
			out.push(line('   ' + palette.rose(text)))
		}
		if (entry.at) out.push(line('   ' + palette.surface(entry.at)))
	}

	if (typeErrors.length > 0) {
		if (stats?.cases?.length) out.push(line())
		out.push(line(palette.rose('✗') + '  ' + palette.ink('типы')))
		for (const error of typeErrors.slice(0, 5)) {
			out.push(line('   ' + palette.rose(error.message)))
			out.push(line('   ' + palette.surface(`${file}:${error.line}`)))
		}
	} else if (typesOnly) {
		out.push(
			line(palette.mint('✓') + '  ' + palette.faint('типы сходятся — здесь проверяет компилятор')),
		)
	}

	const counters = [
		stats ? `${stats.passed}/${stats.total} проверок` : null,
		typeErrors.length > 0 ? `ошибок типов: ${typeErrors.length}` : 'типы ок',
		`${elapsed}с`,
	]
		.filter(Boolean)
		.join('  ·  ')

	out.push(line())
	out.push(rule())
	out.push(line(verdict(status, counters)))
	return out
}

/**
 * Результат пака или всего тренажёра. По всему тренажёру — строка на пак,
 * по паку — строка на незакрытую задачу (зелёные только с `verbose`).
 */
export function renderManyResults(results, { packs, scope, elapsed, verbose = false, width = 90 }) {
	const out = []
	out.push(
		scope
			? top(`${scope.code} · ${scope.title}`, scope.subtitle)
			: top('ПРОВЕРКА', 'весь тренажёр'),
	)
	out.push(line())

	if (!scope) {
		let currentLevel = null
		for (const pack of packs) {
			const rows = results.filter(result => result.pack.code === pack.code)
			const packDone = rows.filter(result => result.status === 'pass').length

			if (pack.level !== currentLevel) {
				currentLevel = pack.level
				out.push(line(palette.surface(`уровень ${currentLevel}`)))
			}

			out.push(
				line(
					palette.accent(padEnd(pack.code, 6)) +
						palette.ink(cell(pack.title, 26)) +
						bar(packDone, rows.length, 20) +
						'  ' +
						(packDone === rows.length ? palette.mint : palette.faint)(
							padEnd(`${packDone}/${rows.length}`, 8),
						),
				),
			)
		}
	} else {
		for (const result of results) {
			// Зелёные строки обычно не нужны: важно то, что осталось.
			if (result.status === 'pass' && !verbose) continue

			const detail = result.stats
				? `${result.stats.passed}/${result.stats.total}`
				: result.typeErrors.length > 0
					? `типы: ${result.typeErrors.length}`
					: 'типы ок'

			out.push(
				line(
					mark(result.status) +
						'  ' +
						palette.accent(padEnd(result.task.id, 9)) +
						starsCell(result.task.stars) +
						palette.ink(cell(result.task.title, Math.max(18, width - 36))) +
						palette.surface(detail),
				),
			)
		}
	}

	const done = results.filter(result => result.status === 'pass').length
	const total = results.length

	out.push(line())
	out.push(rule())
	out.push(
		line(
			bar(done, total, 30) +
				'  ' +
				c.bold(palette.ink(`${done}/${total}`)) +
				palette.faint(`  ${percentOf(done, total)}%  ·  ${elapsed}с`),
		),
	)
	return out
}

/** Ошибка запуска vitest целиком — когда разбирать нечего. */
export function renderRunError(error) {
	const out = [top('ТЕСТЫ НЕ ЗАПУСТИЛИСЬ'), line()]
	for (const text of String(error).split('\n').slice(-12)) out.push(line(palette.rose(text)))
	return out
}
