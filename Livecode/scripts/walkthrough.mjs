/**
 * Разборы решений: разметка, разбор файла и отрисовка в терминал.
 *
 * Разборы пака лежат в `src/drills/<пак>/walkthrough.md`, по разделу на задачу:
 *
 *   ## BAS-07
 *
 *   Индекс растёт вверх, а числа нужны вниз.            ← свободный текст: идея
 *
 *   - `Array.from({ length: N }, fn)` :: что делает      ← из чего состоит
 *
 *   > `countdown(3)`                                     ← пример
 *
 *   1. Math.max(0, 3) = 3 => { length: 3 }               ← шаг => состояние после него
 *
 *   = `[3, 2, 1]`                                        ← итог примера
 *
 *   ! `countdown(0)` :: длина 0 → `[]`                   ← крайний случай
 *
 * Строка с отступом продолжает предыдущий пункт. Пример, у которого и вызов,
 * и итог записаны кодом в обратных кавычках, сверяется с настоящим запуском
 * эталона (`yarn verify`) — итог в разборе не может разойтись с поведением кода.
 */
import fs from 'node:fs'
import path from 'node:path'
import { c, padEnd, palette, visibleWidth } from './lib.mjs'
import { GUTTER, line, row, stars, wrapText } from './ui.mjs'

export const WALKTHROUGH_FILE = 'walkthrough.md'

// ── разбор файла ───────────────────────────────────────────────────────

/** Текст целиком в обратных кавычках — значит это код, а не описание. */
const codeOnly = text => {
	const match = String(text)
		.trim()
		.match(/^`([^`]+)`$/)
	return match ? match[1] : null
}

export function parseWalkthrough(text) {
	const result = new Map()
	let entry = null
	let example = null
	/** Последний пункт, к которому может прилипнуть строка-продолжение. */
	let last = null

	const append = (target, key, extra) => {
		target[key] = target[key] ? `${target[key]} ${extra}` : extra
	}

	for (const raw of String(text).split(/\r?\n/)) {
		const header = raw.match(/^##\s+([A-Z]{2,4}-\d+)\s*$/)
		if (header) {
			entry = { id: header[1], idea: [], parts: [], examples: [], edges: [] }
			result.set(entry.id, entry)
			example = null
			last = null
			continue
		}
		if (!entry) continue

		if (!raw.trim()) {
			last = null
			continue
		}

		// Продолжение предыдущего пункта: строка с отступом сразу под ним.
		if (/^\s{2,}\S/.test(raw) && last) {
			append(last.target, last.key, raw.trim())
			continue
		}

		const lineText = raw.trim()

		const part = lineText.match(/^-\s+(.+?)\s+::\s+(.+)$/)
		if (part) {
			const item = { term: part[1], text: part[2] }
			entry.parts.push(item)
			last = { target: item, key: 'text' }
			continue
		}

		const exampleHead = lineText.match(/^>\s+(.+)$/)
		if (exampleHead) {
			example = { title: exampleHead[1], call: codeOnly(exampleHead[1]), notes: [], steps: [] }
			entry.examples.push(example)
			last = null
			continue
		}

		const step = lineText.match(/^\d+\.\s+(.+)$/)
		if (step && example) {
			const [action, state] = step[1].split(/\s+=>\s+/)
			const item = { action, state: state ?? null }
			example.steps.push(item)
			last = { target: item, key: state === undefined ? 'action' : 'state' }
			continue
		}

		const outcome = lineText.match(/^=\s+(.+)$/)
		if (outcome && example) {
			example.result = outcome[1]
			example.expected = codeOnly(outcome[1])
			last = { target: example, key: 'result' }
			continue
		}

		const edge = lineText.match(/^!\s+(.+?)(?:\s+::\s+(.+))?$/)
		if (edge) {
			const item = { title: edge[2] ? edge[1] : null, text: edge[2] ?? edge[1] }
			entry.edges.push(item)
			last = { target: item, key: 'text' }
			continue
		}

		// Свободный текст: до первого примера — идея, после — пояснение к примеру.
		if (example) example.notes.push(lineText)
		else entry.idea.push(lineText)
		last = null
	}

	return result
}

const cache = new Map()

/** Разборы пака с кешем по времени правки файла. */
export function loadWalkthroughs(pack) {
	const file = path.join(pack.dir, WALKTHROUGH_FILE)
	let stamp = 0
	try {
		stamp = fs.statSync(file).mtimeMs
	} catch {
		return new Map()
	}
	const cached = cache.get(file)
	if (cached?.stamp === stamp) return cached.entries
	const entries = parseWalkthrough(fs.readFileSync(file, 'utf8'))
	cache.set(file, { stamp, entries })
	return entries
}

// ── отрисовка ──────────────────────────────────────────────────────────

/** `код` — акцентом, **важное** — жирным, остальное — основным цветом. */
function inline(text, base = palette.ink) {
	return String(text)
		.split(/(`[^`]+`|\*\*[^*]+\*\*)/)
		.map(part => {
			if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
				return palette.accent(part.slice(1, -1))
			if (part.startsWith('**') && part.endsWith('**'))
				return c.bold(palette.snow(part.slice(2, -2)))
			return base(part)
		})
		.join('')
}

/** Ширина видимого текста после снятия разметки. */
const plainWidth = text => visibleWidth(String(text).replace(/`/g, '').replace(/\*\*/g, ''))

/** Перенос по словам с сохранением разметки: режем по пробелам вне кода. */
function wrapMarked(text, width) {
	// Слово — всё между пробелами, но код в кавычках целиком: пробелы внутри `a, b`
	// не рвут его, а запятая сразу за кодом не отлипает от него.
	const tokens = String(text).match(/(?:`[^`]*`|\*\*[^*]+\*\*|[^\s`])+/g) ?? []
	const rows = []
	let current = ''
	for (const token of tokens) {
		const candidate = current ? `${current} ${token}` : token
		if (current && plainWidth(candidate) > width) {
			rows.push(current)
			current = token
		} else {
			current = candidate
		}
	}
	if (current) rows.push(current)
	return rows.length ? rows : ['']
}

const KEYWORDS = new Set(
	(
		'const let var function return if else for while do of in new class extends ' +
		'async await yield export import from type interface keyof typeof as satisfies ' +
		'switch case break continue default throw try catch finally null undefined true false this void never infer readonly'
	).split(' '),
)

/** Подсветка кода одной строкой: строки, числа, ключевые слова, комментарии. */
export function highlight(source) {
	const pattern =
		/(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g
	let out = ''
	for (const match of source.matchAll(pattern)) {
		const [token, comment, string, number, word] = match
		if (comment) out += palette.faint(comment)
		else if (string) out += palette.mint(string)
		else if (number) out += palette.amber(number)
		else if (word) out += KEYWORDS.has(word) ? palette.violet(word) : palette.ink(word)
		else out += palette.faint(token)
	}
	return out
}

/** Код эталона без JSDoc: пояснение из комментария идёт отдельным блоком. */
function splitSolution(body) {
	const doc = body.match(/\/\*\*([\s\S]*?)\*\//)
	const note = doc
		? doc[1]
				.split('\n')
				.map(entry => entry.replace(/^\s*\*\s?/, ''))
				.join(' ')
				.replace(/\s+/g, ' ')
				.trim()
		: ''
	const code = body
		.replace(/\/\*\*[\s\S]*?\*\/\s*/, '')
		.replace(/^\t/gm, '  ')
		.trim()
	return { code, note }
}

const section = title => row(GUTTER.node, c.bold(palette.ink(title)))
/**
 * Строка кода, перенесённая по ширине. Рвём по последнему пробелу, который не внутри
 * строкового литерала; продолжение сдвигается на уровень глубже исходной строки.
 */
function wrapCode(source, width) {
	if (source.length <= width) return [source]
	const indent = source.match(/^\s*/)[0] + '    '
	const rows = []
	let rest = source
	let first = true

	while (rest.length > (first ? width : width - indent.length)) {
		const limit = first ? width : width - indent.length
		let quote = null
		let cut = -1
		for (let index = 0; index < limit; index += 1) {
			const symbol = rest[index]
			if (quote) {
				if (symbol === '\\') index += 1
				else if (symbol === quote) quote = null
			} else if (symbol === "'" || symbol === '"' || symbol === '`') quote = symbol
			else if (symbol === ' ' && index > 0) cut = index
		}
		if (cut <= 0) break
		rows.push((first ? '' : indent) + rest.slice(0, cut))
		rest = rest.slice(cut + 1)
		first = false
	}
	rows.push((first ? '' : indent) + rest)
	return rows
}

const codeLine = text => line(palette.surface('▏ ') + highlight(text))

/**
 * Разбор задачи строками для терминала. `width` — полезная ширина под текст
 * (без направляющей слева).
 */
export function renderWalkthrough({ pack, task, entry, width = 80 }) {
	const out = []
	const text = Math.max(30, width - 6)

	out.push(
		row(
			GUTTER.top,
			c.bold(palette.accent(`${task.id} · ${task.title}`)) +
				palette.surface('  ·  ') +
				palette.faint('разбор решения'),
		),
	)
	out.push(line(stars(task.stars) + '   ' + palette.surface(`${pack.code} · ${pack.title}`)))
	out.push(line())

	const solution = pack.solutions.get(task.id)
	const { code, note } = solution ? splitSolution(solution.body) : { code: '', note: '' }

	if (code) {
		out.push(section('РЕШЕНИЕ'))
		out.push(line())
		for (const source of code.split('\n')) {
			for (const part of wrapCode(source, text - 2)) out.push(codeLine(part))
		}
		out.push(line())
	}

	if (!entry) {
		out.push(line(palette.amber('Пошагового разбора для этой задачи пока нет.')))
		if (note) {
			out.push(line())
			out.push(section('НА ЗАМЕТКУ'))
			out.push(line())
			for (const part of wrapMarked(note, text)) out.push(line(inline(part)))
		}
		return out
	}

	if (entry.idea.length) {
		out.push(section('ИДЕЯ'))
		out.push(line())
		for (const paragraph of entry.idea) {
			for (const part of wrapMarked(paragraph, text)) out.push(line(inline(part)))
		}
		out.push(line())
	}

	if (entry.parts.length) {
		out.push(section('ИЗ ЧЕГО СОСТОИТ'))
		out.push(line())
		for (const part of entry.parts) {
			out.push(line(inline(part.term, palette.accent)))
			for (const piece of wrapMarked(part.text, text - 3)) out.push(line('   ' + inline(piece)))
		}
		out.push(line())
	}

	for (const example of entry.examples) {
		out.push(
			section('ПО ШАГАМ') +
				palette.surface('  ·  ') +
				inline(example.call ? `\`${example.call}\`` : example.title),
		)
		out.push(line())

		for (const note of example.notes) {
			for (const part of wrapMarked(note, text)) out.push(line(inline(part, palette.faint)))
		}
		if (example.notes.length) out.push(line())

		const number = String(example.steps.length).length
		const actionWidth = Math.min(
			Math.max(...example.steps.map(step => plainWidth(step.action)), 10),
			Math.floor(text * 0.55),
		)

		example.steps.forEach((step, index) => {
			const label = palette.surface(String(index + 1).padStart(number) + '  ')
			const indent = ' '.repeat(number + 2)
			const actionRows = wrapMarked(step.action, actionWidth)
			const fits =
				step.state &&
				actionRows.length === 1 &&
				plainWidth(step.state) <= text - actionWidth - number - 6

			if (fits) {
				out.push(
					line(
						label +
							padEnd(inline(actionRows[0]), actionWidth) +
							palette.surface('  →  ') +
							inline(step.state, palette.snow),
					),
				)
				return
			}

			actionRows.forEach((part, rowIndex) =>
				out.push(line((rowIndex === 0 ? label : indent) + inline(part))),
			)
			if (step.state) {
				for (const part of wrapMarked(step.state, text - number - 6)) {
					out.push(line(indent + palette.surface('→ ') + inline(part, palette.snow)))
				}
			}
		})

		if (example.result) {
			out.push(line())
			out.push(line(palette.mint('═ ') + c.bold(inline(example.result, palette.mint))))
		}
		out.push(line())
	}

	if (entry.edges.length) {
		out.push(section('КРАЙНИЕ СЛУЧАИ'))
		out.push(line())
		for (const edge of entry.edges) {
			if (edge.title) out.push(line(inline(edge.title, palette.accent)))
			for (const piece of wrapMarked(edge.text, text - 3)) {
				out.push(line((edge.title ? '   ' : '') + inline(piece)))
			}
		}
		out.push(line())
	}

	if (note) {
		out.push(section('НА ЗАМЕТКУ'))
		out.push(line())
		for (const part of wrapMarked(note, text)) out.push(line(inline(part, palette.faint)))
		out.push(line())
	}

	return out
}
