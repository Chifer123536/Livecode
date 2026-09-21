/**
 * Общее оформление консольных команд тренажёра.
 * Боковая направляющая ◆ │ ╰ связывает блоки вывода в один столбец,
 * поэтому любая команда читается одинаково.
 */
import { c, palette, padEnd, visibleWidth } from './lib.mjs'

export const GUTTER = { top: '◆', node: '◇', line: '│', end: '╰' }

/** Строка с направляющей. */
export const row = (glyph, text = '') => '  ' + palette.faint(glyph) + (text ? '  ' + text : '')

export const line = (text = '') => row(GUTTER.line, text)

export const top = (title, subtitle = '') =>
	row(
		GUTTER.top,
		c.bold(palette.accent(title)) +
			(subtitle ? palette.surface('  ·  ') + palette.faint(subtitle) : ''),
	)

export const node = title => row(GUTTER.node, c.bold(palette.ink(title)))

export const end = (text = '') => row(GUTTER.end, text)

/** Клавиша или короткая метка на тёмной подложке. */
export const key = label => palette.surface(` ${label} `, { bg: true })

/** Печать блока строк с пустой строкой сверху. */
export function block(lines) {
	console.log('')
	for (const entry of lines) console.log(entry)
}

/** Звёзды сложности: чем больше закрашенных, тем теплее цвет. */
export function stars(value) {
	if (!value) return ''
	const filled = (value.match(/★/g) ?? []).length
	const color = filled >= 3 ? palette.rose : filled === 2 ? palette.amber : palette.mint
	return color(value)
}

/** Отметка состояния задачи. */
export function mark(state) {
	if (state === 'pass') return palette.mint('●')
	if (state === 'partial') return palette.amber('◐')
	if (state === 'fail') return palette.rose('○')
	return palette.surface('○')
}

/** Многострочный текст под направляющей, с отступом. */
export const lines = text =>
	String(text)
		.split('\n')
		.map(entry => line(entry))

/** Блок кода: приглушённый текст с тонкой левой полосой. */
export const code = text =>
	String(text)
		.split('\n')
		.map(
			entry =>
				'  ' + palette.faint(GUTTER.line) + '  ' + palette.surface('▏') + ' ' + palette.ink(entry),
		)

/** Усечение по границе слова с многоточием — чтобы строка не вылезала за край. */
export function ellipsis(text, max) {
	const value = String(text)
	if (value.length <= max) return value
	const cut = value.slice(0, max - 1)
	const space = cut.lastIndexOf(' ')
	return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…'
}

/** Две колонки: слева акцент, справа пояснение. */
export function columns(rows, gap = 3) {
	const pad = Math.max(...rows.map(([left]) => visibleWidth(left))) + gap
	return rows.map(([left, right]) =>
		line(palette.accent(padEnd(left, pad)) + palette.surface(right)),
	)
}
