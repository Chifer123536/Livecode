/**
 * Сверка разборов с реальностью. Запускается в `yarn verify`, в обычный прогон тестов не входит.
 *
 * Для каждого примера, у которого и вызов, и итог записаны кодом:
 *   > `countdown(3)`
 *   = `[3, 2, 1]`
 * вызов выполняется против эталонного решения пака, итог — как выражение JS,
 * и они обязаны совпасть. Так итог в разборе не может разойтись с поведением кода.
 *
 * Плюс проверяется, что каждый раздел `## ID` относится к существующей задаче пака.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadPacks } from './lib.mjs'
import { loadWalkthroughs, WALKTHROUGH_FILE } from './walkthrough.mjs'

const packs = loadPacks()

/** Выполнить выражение с экспортами эталона в области видимости. */
async function evaluate(expression, scope) {
	const names = Object.keys(scope).filter(name => name !== 'default')
	const run = new Function(...names, `return (${expression})`)
	return await run(...names.map(name => scope[name]))
}

for (const pack of packs) {
	const entries = loadWalkthroughs(pack)
	if (entries.size === 0) continue

	describe(`разборы пака ${pack.code}`, () => {
		it('каждый раздел относится к задаче пака', () => {
			const strangers = [...entries.keys()].filter(id => !pack.tasks.has(id))
			expect(strangers).toEqual([])
		})

		it('разметка кода не вложена и не экранирована', () => {
			// Шаблонная строка внутри кода рвёт подсветку: двойные кавычки-бэктики
			// или экранированный бэктик перед ${ читаются несколькими кусками.
			const text = fs.readFileSync(path.join(pack.dir, WALKTHROUGH_FILE), 'utf8')
			const broken = text
				.split(/\r?\n/)
				.map((row, index) => [index + 1, row])
				.filter(([, row]) => row.includes('``') || /\\`\$\{/.test(row))
				.map(([number]) => number)
			expect(broken).toEqual([])
		})

		const checks = []
		for (const entry of entries.values()) {
			for (const example of entry.examples) {
				if (example.call && example.expected) checks.push({ id: entry.id, example })
			}
		}
		if (checks.length === 0 || !pack.solutionFile) return

		it.each(checks.map(check => [`${check.id}: ${check.example.call}`, check]))(
			'%s',
			async (_name, { example }) => {
				const scope = await import(pathToFileURL(pack.solutionFile).href)
				const actual = await evaluate(example.call, scope)
				const expected = await evaluate(example.expected, {})
				expect(actual).toEqual(expected)
			},
		)
	})
}
