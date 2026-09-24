/**
 * Общее оформление консольных команд тренажёра.
 * Боковая направляющая ◆ │ ╰ связывает блоки вывода в один столбец,
 * поэтому любая команда читается одинаково.
 */
import { c, palette, padEnd, strip, termWidth, visibleWidth } from './lib.mjs'

export const GUTTER = { top: '◆', node: '◇', line: '│', end: '╰', fork: '├' }

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

/** Горизонтальный разделитель внутри колонки: подводит черту, но не спорит с текстом. */
export const rule = (width = Math.min(58, termWidth())) =>
	'  ' + palette.faint(GUTTER.fork) + palette.surface('─'.repeat(Math.max(4, width - 2)))

/** Клавиша или короткая метка: светлый текст на плотной подложке. */
export const key = label => palette.chip(c.bold(palette.snow(` ${label} `)), { bg: true })

/** Крупная цветная плашка статуса. */
export const badge = (label, color = palette.accent) => c.bold(color(` ${label} `))

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

/** Звёзды фиксированной ширины — чтобы колонки не плясали. */
export const starsCell = (value, width = 5) =>
	stars(value) + ' '.repeat(Math.max(0, width - (value?.length ?? 0)))

/** Отметка состояния задачи. */
export function mark(state) {
	if (state === 'pass') return palette.mint('●')
	if (state === 'partial') return palette.amber('◐')
	if (state === 'fail') return palette.rose('○')
	return palette.surface('○')
}

/** Подпись состояния словами — для одиночной задачи, где значка мало. */
export function markWord(state) {
	if (state === 'pass') return palette.mint('сдана')
	if (state === 'partial') return palette.amber('частично')
	if (state === 'fail') return palette.rose('не сдана')
	return palette.surface('не проверялась')
}

/** Многострочный текст под направляющей, с отступом. */
export const lines = text =>
	String(text)
		.split('\n')
		.map(entry => line(entry))

/** Блок кода: приглушённый текст с тонкой левой полосой. */
export const code = (text, color = palette.ink) =>
	String(text)
		.split('\n')
		.map(
			entry => '  ' + palette.faint(GUTTER.line) + '  ' + palette.surface('▏') + ' ' + color(entry),
		)

/** Усечение по границе слова с многоточием — чтобы строка не вылезала за край. */
export function ellipsis(text, max) {
	const value = String(text)
	if (max <= 1) return value.slice(0, Math.max(0, max))
	if (visibleWidth(value) <= max) return value
	const plain = strip(value)
	const cut = plain.slice(0, max - 1)
	const space = cut.lastIndexOf(' ')
	return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…'
}

/**
 * Обрезать строку по видимой ширине, не разрывая ANSI-последовательности.
 * Нужно там, где ширину диктует окно: цвета сохраняются, хвост заменяется многоточием.
 */
export function clip(text, max) {
	const value = String(text)
	if (visibleWidth(value) <= max || max <= 0) return value

	let out = ''
	let visible = 0
	for (const part of value.split(/(\x1b\[[0-9;]*m)/)) {
		if (part.startsWith('\x1b[')) {
			out += part
			continue
		}
		for (const symbol of part) {
			if (visible >= max - 1) return out + '…\x1b[39m'
			out += symbol
			visible += 1
		}
	}
	return out
}

/** Текст в ячейку фиксированной ширины: сперва обрезать, потом добить пробелами. */
export const cell = (text, width) => padEnd(ellipsis(text, width), width)

/** Перенос длинного текста по словам. */
export function wrapText(text, width) {
	const words = String(text).split(/\s+/).filter(Boolean)
	const rows = []
	let current = ''
	for (const word of words) {
		if (current && (current + ' ' + word).length > width) {
			rows.push(current)
			current = word
		} else {
			current = current ? current + ' ' + word : word
		}
	}
	if (current) rows.push(current)
	return rows.length > 0 ? rows : ['']
}

/** Две колонки: слева акцент, справа пояснение. */
export function columns(rows, gap = 3) {
	const pad = Math.max(...rows.map(([left]) => visibleWidth(left))) + gap
	return rows.map(([left, right]) =>
		line(palette.accent(padEnd(left, pad)) + palette.surface(right)),
	)
}

/** Подсказка «что дальше»: команда на подложке плюс пояснение. */
export const hint = (command, about) => key(command) + palette.faint('  ' + about)

/**
 * Крутилка на время долгой операции. Молчит, если вывод не в терминал,
 * и всегда затирает за собой строку — иначе остаток кадра липнет к отчёту.
 */
export function spinner(label) {
	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
	if (!process.stdout.isTTY) return { stop: () => {} }

	let index = 0
	const draw = () => {
		const frame = palette.accent(frames[index++ % frames.length])
		process.stdout.write('\r  ' + frame + '  ' + palette.faint(label) + '   ')
	}
	draw()
	const timer = setInterval(draw, 80)

	return {
		stop: () => {
			clearInterval(timer)
			process.stdout.write('\r' + ' '.repeat(visibleWidth(label) + 12) + '\r')
		},
	}
}
