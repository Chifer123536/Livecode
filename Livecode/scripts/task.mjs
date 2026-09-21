#!/usr/bin/env node
/**
 * Карточка задачи для вставки в claude.ai.
 *
 *   yarn task                 список паков
 *   yarn task ARR             список задач пака
 *   yarn task BAS-07          карточка задачи
 *   yarn task BAS-07 -c       карточка + копия в буфер обмена
 *   yarn task BAS-07 -s       карточка вместе с эталонным решением
 *   yarn task ARR --all       весь пак одной карточкой
 *   yarn task next            первая нерешённая задача (после `yarn progress`)
 */
import { spawn } from 'node:child_process'
import { bar, c, findPack, findTask, loadPacks, padEnd, readProgress } from './lib.mjs'

const PROMPT = `Ты — сильный фронтенд-наставник. Я готовлюсь к лайвкоду на позицию junior frontend (React + TypeScript).
Разбери задачу ниже строго по шагам и НЕ давай код раньше шага 4:
1. Переформулируй условие своими словами и скажи, какой навык оно проверяет.
2. Дай 2-3 уточняющих вопроса, которые я обязан задать интервьюеру до кода.
3. Алгоритм словами, по шагам, без кода.
4. Решение кодом с построчным пояснением.
5. Краевые случаи и типичные ошибки именно в этой задаче.
6. Сложность по времени и памяти.
7. Две похожие задачи для закрепления (только условия, без решений).
Отвечай по-русски, technically, без воды.`

function stripTodo(body) {
	return body
		.replace(/=>\s*todo\([^)]*\)/g, '=> {\n\t// твой код\n}')
		.replace(/\btodo\([^)]*\)/g, '/* твой код */')
}

function taskCard(pack, task, { withSolution = false } = {}) {
	const lang = pack.tasksFile.endsWith('.tsx') ? 'tsx' : 'ts'
	const out = []

	out.push(PROMPT, '')
	out.push(`# ${task.id} · ${task.title}${task.stars ? `  ${task.stars}` : ''}`)
	out.push(`Пак: ${pack.name} — ${pack.title} (${pack.subtitle})`, '')
	out.push('## Заготовка и условие')
	out.push('```' + lang, stripTodo(task.body), '```', '')

	const test = pack.tests.get(task.id)
	if (test) {
		out.push('## Тесты, которые должны пройти (vitest)')
		out.push('```' + lang, test.body, '```', '')
	}

	if (withSolution) {
		const solution = pack.solutions.get(task.id)
		if (solution) {
			out.push('## Эталонное решение (сверить ПОСЛЕ своей попытки)')
			out.push('```' + lang, solution.body, '```', '')
		}
	}

	return out.join('\n')
}

function packCard(pack, options) {
	const cards = [...pack.tasks.values()].map(task =>
		taskCard(pack, task, options)
			.split('\n')
			.slice(PROMPT.split('\n').length + 1)
			.join('\n'),
	)
	return [PROMPT, '', `# Пак ${pack.code} · ${pack.title}`, pack.why ?? '', '', ...cards].join('\n')
}

function copyToClipboard(text) {
	const command =
		process.platform === 'win32' ? 'clip' : process.platform === 'darwin' ? 'pbcopy' : 'xclip'
	const args = process.platform === 'linux' ? ['-selection', 'clipboard'] : []
	return new Promise(resolve => {
		try {
			const child = spawn(command, args, {
				stdio: ['pipe', 'ignore', 'ignore'],
				shell: process.platform === 'win32',
			})
			child.on('error', () => resolve(false))
			child.on('close', code => resolve(code === 0))
			child.stdin.end(text)
		} catch {
			resolve(false)
		}
	})
}

function listPacks(packs) {
	const progress = readProgress()
	const titleWidth = Math.max(...packs.map(p => p.title.length)) + 2
	const subWidth = Math.min(40, Math.max(...packs.map(p => p.subtitle.length)) + 2)
	const rule = '─'.repeat(11 + titleWidth + subWidth + 26)

	console.log()
	console.log(c.bold('  ПАКИ ЗАДАЧ') + c.gray('   (yarn task <КОД> — список задач пака)'))
	console.log(c.gray('  ' + rule))

	let totalTasks = 0
	let totalDone = 0
	let currentLevel = null

	for (const pack of packs) {
		if (pack.level !== currentLevel) {
			currentLevel = pack.level
			console.log(
				c.gray(`  ── уровень ${currentLevel} ` + '─'.repeat(Math.max(0, rule.length - 13))),
			)
		}

		const count = pack.tasks.size
		totalTasks += count
		const done = progress?.packs?.[pack.code]?.done ?? 0
		totalDone += done

		console.log(
			'  ' +
				c.cyan(padEnd(pack.code, 6)) +
				padEnd(c.bold(pack.title), titleWidth) +
				c.gray(padEnd(pack.subtitle.slice(0, subWidth - 2), subWidth)) +
				padEnd(`${count} зад.`, 9) +
				(progress
					? bar(done, count, 12) + ' ' + c.gray(`${done}/${count}`)
					: c.gray(`~${pack.norm} мин`)),
		)
	}

	console.log(c.gray('  ' + rule))
	console.log(
		`  ${c.bold('Всего:')} ${c.bold(String(totalTasks))} задач в ${packs.length} паках` +
			(progress ? ` · решено ${c.green(String(totalDone))}` : ''),
	)
	console.log()
	console.log(c.gray('  yarn task ARR        — список задач пака'))
	console.log(c.gray('  yarn task BAS-07     — карточка задачи'))
	console.log(c.gray('  yarn task BAS-07 -c  — карточка сразу в буфер обмена'))
	console.log(c.gray('  yarn progress        — где ты сейчас'))
	console.log()
}

function listPack(pack) {
	const progress = readProgress()
	console.log()
	console.log(`  ${c.bold(pack.code + ' · ' + pack.title)} ${c.gray('— ' + pack.subtitle)}`)
	if (pack.why) console.log(c.gray('  ' + pack.why))
	console.log(c.gray('  ' + '─'.repeat(78)))

	for (const task of pack.tasks.values()) {
		const state = progress?.tasks?.[task.id]
		const mark = state === 'pass' ? c.green('✔') : state === 'fail' ? c.red('·') : c.gray('·')
		console.log(
			`  ${mark} ${c.cyan(padEnd(task.id, 9))} ${padEnd(task.stars || '', 5)} ${task.title}`,
		)
	}

	console.log(c.gray('  ' + '─'.repeat(78)))
	console.log(
		c.gray(`  норматив на пак: ~${pack.norm} мин · папка: src/drills/${pack.name}/tasks/`),
	)
	console.log(
		c.gray(`  yarn solve ${[...pack.tasks.keys()][0]}   — открыть задачу и гонять только её тесты`),
	)
	console.log()
}

async function main() {
	const argv = process.argv.slice(2)
	const flags = new Set(argv.filter(a => a.startsWith('-')))
	const args = argv.filter(a => !a.startsWith('-'))
	const packs = loadPacks()

	if (packs.length === 0) {
		console.log(c.red('Паки не найдены. Ожидается src/drills/<pack>/pack.json'))
		process.exit(1)
	}

	if (args.length === 0) return listPacks(packs)

	let query = args[0]

	if (query.toLowerCase() === 'next') {
		const progress = readProgress()
		if (!progress) {
			console.log(
				c.yellow('Сначала запусти `yarn progress` — без него неизвестно, что уже решено.'),
			)
			return
		}
		const pending = packs
			.flatMap(p => [...p.tasks.keys()])
			.find(id => progress.tasks?.[id] !== 'pass')
		if (!pending) {
			console.log(c.green('Всё решено. Можешь идти на собес.'))
			return
		}
		query = pending
	}

	const withSolution = flags.has('-s') || flags.has('--solution')
	const copy = flags.has('-c') || flags.has('--copy')

	const found = findTask(packs, query)
	if (found) {
		const card = taskCard(found.pack, found.task, { withSolution })
		console.log(card)
		if (copy) {
			const ok = await copyToClipboard(card)
			console.error(
				ok ? c.green('\n[скопировано в буфер обмена]') : c.yellow('\n[скопировать не удалось]'),
			)
		} else {
			console.error(c.gray('\n[подсказка] добавь -c, чтобы карточка сразу ушла в буфер обмена'))
		}
		return
	}

	const pack = findPack(packs, query)
	if (pack) {
		if (flags.has('--all')) {
			const card = packCard(pack, { withSolution })
			console.log(card)
			if (copy) await copyToClipboard(card)
			return
		}
		return listPack(pack)
	}

	console.log(c.red(`Не нашла «${query}». Запусти \`yarn task\` без аргументов — покажу список.`))
	process.exit(1)
}

main()
