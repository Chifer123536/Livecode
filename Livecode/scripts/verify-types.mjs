#!/usr/bin/env node
/**
 * Самопроверка типов тренажёра.
 *
 * Ошибки в `tasks.ts` — это нормально: там лежат нерешённые задачи,
 * и проверки вида Expect<Equal<...>> обязаны краснеть, пока задача не сделана.
 * А вот ошибка в `solution.*` означает, что сломан эталон — это баг тренажёра.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { c, ROOT } from './lib.mjs'

const tsconfig = path.join(ROOT, 'tsconfig.app.json')
const tscBin = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')

if (!fs.existsSync(tscBin)) {
	console.log(c.yellow('typescript не установлен — проверка типов пропущена'))
	process.exit(0)
}

const result = spawnSync(process.execPath, [tscBin, '-p', tsconfig, '--noEmit', '--pretty', 'false'], {
	cwd: ROOT,
	encoding: 'utf8',
})

const lines = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.split(/\r?\n/).filter(line => /error TS\d+/.test(line))

const inSolutions = lines.filter(line => /solution\.tsx?\(/.test(line))
const inTasks = lines.filter(line => /tasks\.tsx?\(/.test(line) && !/tasks\.test\./.test(line))
const elsewhere = lines.filter(line => !inSolutions.includes(line) && !inTasks.includes(line))

if (inSolutions.length > 0 || elsewhere.length > 0) {
	console.log(c.red('\n  Сломаны типы вне задач — это баг тренажёра:\n'))
	for (const line of [...inSolutions, ...elsewhere].slice(0, 40)) console.log('   ' + line)
	process.exit(1)
}

const note = inTasks.length > 0 ? c.gray(` (в нерешённых задачах ${inTasks.length} — так и должно быть)`) : ''
console.log(c.green('  Типы эталонов в порядке') + note)
