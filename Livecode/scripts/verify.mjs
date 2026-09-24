#!/usr/bin/env node
/**
 * Самопроверка тренажёра: всё, что должно быть зелёным независимо от твоих решений.
 *
 *   yarn verify
 *
 * 1. Тесты против эталонов — сами тесты корректны.
 * 2. Разборы против эталонов — итоги примеров совпадают с настоящим запуском.
 * 3. Типы эталонов — компилятор не спорит с решениями.
 *
 * Красное здесь — сломан тренажёр, а не ты.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { ROOT } from './lib.mjs'

const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs')

const steps = [
	['тесты против эталонов', [vitest, 'run', '--mode', 'solutions']],
	['разборы против эталонов', [vitest, 'run', '--mode', 'walkthrough']],
	['типы эталонов', [path.join(ROOT, 'scripts', 'verify-types.mjs')]],
]

for (const [label, args] of steps) {
	console.log(`\n── ${label} ──`)
	const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' })
	if (result.status !== 0) {
		console.log(`\n✗ не прошло: ${label}\n`)
		process.exit(result.status ?? 1)
	}
}

console.log('\n✓ тренажёр цел\n')
