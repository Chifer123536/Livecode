#!/usr/bin/env node
/**
 * Сброс решений к исходным заготовкам.
 *
 *   yarn clean                 что можно сбросить (ничего не трогает)
 *   yarn clean BAS-07          одна задача
 *   yarn clean BAS             весь пак
 *   yarn clean BAS ARR STR     несколько паков разом
 *   yarn clean --level 1       все паки уровня
 *   yarn clean --done          только те задачи, что сейчас зачтены
 *   yarn clean --all           весь тренажёр
 *   yarn clean BAS --dry       показать список, файлы не трогать
 *   yarn clean BAS -y          без подтверждения
 *   yarn clean --snapshot      пересобрать stubs.json (после добавления новых задач)
 *
 * Заготовки лежат в `stubs.json`. Он собирается из ПЕРВОЙ версии каждого файла
 * в истории git: решённая и закоммиченная задача уже не годится как эталон.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import {
	c,
	findPack,
	findTask,
	loadPacks,
	padEnd,
	palette,
	readProgress,
	ROOT,
	statusOf,
} from './lib.mjs'
import { columns, end, GUTTER, key, line, node, row, top } from './ui.mjs'

const STUBS = path.join(ROOT, 'stubs.json')

const toPosix = value => value.split(path.sep).join('/')

function gitRoot() {
	const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: ROOT, encoding: 'utf8' })
	if (result.status !== 0) return null
	return result.stdout.trim()
}

/**
 * Коммит, в котором файл появился впервые. Один вызов git на весь репозиторий:
 * по файлу на вызов выходило под минуту.
 */
function firstAddCommits(root) {
	const result = spawnSync(
		'git',
		['log', '--reverse', '--diff-filter=A', '--format=@%H', '--name-only'],
		{
			cwd: root,
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024,
		},
	)
	const map = new Map()
	if (result.status !== 0) return map

	let sha = null
	for (const line of result.stdout.split(/\r?\n/)) {
		if (line.startsWith('@')) {
			sha = line.slice(1)
			continue
		}
		if (!line.trim() || !sha) continue
		// --reverse идёт от старых к новым, поэтому первое попадание и есть исходное.
		if (!map.has(line)) map.set(line, sha)
	}
	return map
}

function readStubs() {
	if (!fs.existsSync(STUBS)) return null
	try {
		return JSON.parse(fs.readFileSync(STUBS, 'utf8'))
	} catch {
		return null
	}
}

/**
 * Код берём из первой версии файла (там гарантированно заготовка),
 * а текст условия — из текущей: формулировки правились уже после,
 * и откатывать их вместе с решением нельзя.
 */
function mergeWording(stubContent, currentContent) {
	if (!currentContent || currentContent === stubContent) return stubContent
	const doc = /\/\*\*[\s\S]*?\*\//
	const fresh = currentContent.match(doc)
	if (!fresh || !doc.test(stubContent)) return stubContent
	return stubContent.replace(doc, fresh[0])
}

function snapshot(packs) {
	const root = gitRoot()
	if (!root) {
		console.log(c.red('  git не найден — заготовки брать неоткуда.'))
		process.exit(1)
	}

	console.log(c.gray('  читаю историю git...'))
	const added = firstAddCommits(root)
	const tasks = {}
	let fromGit = 0
	let fromDisk = 0

	const all = packs.flatMap(pack => [...pack.tasks.values()].map(task => ({ pack, task })))

	all.forEach(({ task }, index) => {
		const file = task.file
		if (!file) return
		const relGit = toPosix(path.relative(root, file))
		const sha = added.get(relGit)

		let content = null
		if (sha) {
			const show = spawnSync('git', ['show', `${sha}:${relGit}`], {
				cwd: root,
				encoding: 'utf8',
				maxBuffer: 8 * 1024 * 1024,
			})
			if (show.status === 0) content = show.stdout
		}

		if (content === null) {
			content = fs.readFileSync(file, 'utf8')
			fromDisk += 1
		} else {
			content = mergeWording(content, fs.readFileSync(file, 'utf8'))
			fromGit += 1
		}

		tasks[task.id] = { file: toPosix(path.relative(ROOT, file)), content }

		if (index % 50 === 0) process.stdout.write(`\r  ${c.gray(`${index}/${all.length}`)}   `)
	})

	process.stdout.write('\r' + ' '.repeat(40) + '\r')

	fs.writeFileSync(
		STUBS,
		JSON.stringify({ generatedAt: new Date().toISOString(), tasks }, null, '\t'),
	)
	console.log(c.green(`  stubs.json собран: ${Object.keys(tasks).length} задач`))
	console.log(c.gray(`  из истории git: ${fromGit} · с диска как есть: ${fromDisk}`))
	if (fromDisk > 0) {
		console.log(
			c.yellow(
				'  Файлы, которых нет в истории, записаны в текущем виде — проверь, что они пустые заготовки.',
			),
		)
	}
}

/** Задача считается тронутой, если её файл отличается от эталонной заготовки. */
function isDirty(entry) {
	const file = path.join(ROOT, entry.file)
	if (!fs.existsSync(file)) return false
	return fs.readFileSync(file, 'utf8') !== entry.content
}

function selectTasks(packs, args, flags, stubs) {
	const progress = readProgress()
	const all = packs.flatMap(pack => [...pack.tasks.values()].map(task => ({ pack, task })))

	let chosen = []

	if (flags.has('--all')) {
		chosen = all
	} else if (flags.level != null) {
		chosen = all.filter(({ pack }) => pack.level === flags.level)
		if (chosen.length === 0) console.log(c.yellow(`  Паков уровня ${flags.level} нет.`))
	} else if (args.length > 0) {
		for (const arg of args) {
			const task = findTask(packs, arg)
			if (task) {
				chosen.push(task)
				continue
			}
			const pack = findPack(packs, arg)
			if (pack) {
				chosen.push(...[...pack.tasks.values()].map(t => ({ pack, task: t })))
				continue
			}
			console.log(c.red(`  Не нашла «${arg}» — ни задача, ни пак. Пропускаю.`))
		}
	}

	if (flags.has('--done')) {
		const base = chosen.length > 0 ? chosen : all
		chosen = base.filter(({ task }) => statusOf(progress, task.id) === 'pass')
		if (!progress) console.log(c.yellow('  Прогресс не считался — сначала `yarn ok --all`.'))
	}

	// Сбрасывать нетронутое бессмысленно: файл и так совпадает с заготовкой.
	return chosen.filter(({ task }) => stubs.tasks[task.id] && isDirty(stubs.tasks[task.id]))
}

function overview(packs, stubs) {
	const progress = readProgress()
	const out = ['']
	out.push(top('СБРОС', 'изменённые относительно заготовки'))
	out.push(line())

	let total = 0
	for (const pack of packs) {
		const dirty = [...pack.tasks.values()].filter(
			task => stubs.tasks[task.id] && isDirty(stubs.tasks[task.id]),
		)
		if (dirty.length === 0) continue
		total += dirty.length
		const done = dirty.filter(task => statusOf(progress, task.id) === 'pass').length
		out.push(
			line(
				palette.accent(padEnd(pack.code, 6)) +
					palette.ink(padEnd(pack.title, 26)) +
					palette.amber(padEnd(`${dirty.length} тронуто`, 14)) +
					palette.surface(`сдано ${done}`),
			),
		)
	}

	out.push(line())
	if (total === 0) {
		out.push(node(palette.mint('Всё совпадает с заготовками — сбрасывать нечего.')))
	} else {
		out.push(node(`Всего тронуто: ${c.bold(palette.ink(String(total)))}`))
	}

	out.push(line())
	out.push(
		...columns([
			['yarn clean BAS-07', 'одна задача'],
			['yarn clean BAS', 'весь пак'],
			['yarn clean --level 1', 'все паки уровня'],
			['yarn clean --done', 'только зачтённые'],
			['yarn clean --all', 'всё разом'],
		]),
	)
	out.push(end(palette.surface('добавь --dry, чтобы только посмотреть')))
	out.push('')

	console.log(out.join('\n'))
}

async function confirm(count) {
	if (!process.stdin.isTTY) {
		console.log(line(palette.amber('Неинтерактивный запуск — добавь -y, если точно надо.')))
		return false
	}
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
	const answer = await rl.question(
		row(
			GUTTER.node,
			palette.amber(`Сбросить ${count} задач(и)? Решения будут стёрты. `) + key('y / N') + ' ',
		),
	)
	rl.close()
	return /^(y|yes|д|да)$/i.test(answer.trim())
}

async function main() {
	const argv = process.argv.slice(2)
	const flags = new Set(argv.filter(a => a.startsWith('-')))
	const args = argv.filter(a => !a.startsWith('-'))

	// --level 1 приходит двумя аргументами: сам флаг и число следом.
	flags.level = null
	const levelIndex = argv.indexOf('--level')
	if (levelIndex !== -1) {
		const value = Number(argv[levelIndex + 1])
		if (Number.isFinite(value)) {
			flags.level = value
			const position = args.indexOf(String(argv[levelIndex + 1]))
			if (position !== -1) args.splice(position, 1)
		}
	}

	const packs = loadPacks()
	if (packs.length === 0) {
		console.log(c.red('Паки не найдены.'))
		process.exit(1)
	}

	if (flags.has('--snapshot')) return snapshot(packs)

	const stubs = readStubs()
	if (!stubs) {
		console.log('')
		console.log(line(palette.rose('Нет stubs.json — заготовки неизвестны.')))
		console.log(end(key('yarn clean --snapshot') + palette.faint('  собрать их один раз')))
		console.log('')
		process.exit(1)
	}

	if (args.length === 0 && !flags.has('--all') && !flags.has('--done') && flags.level == null) {
		return overview(packs, stubs)
	}

	const chosen = selectTasks(packs, args, flags, stubs)

	if (chosen.length === 0) {
		console.log('')
		console.log(end(palette.mint('Нечего сбрасывать — выбранные задачи уже в исходном виде.')))
		console.log('')
		return
	}

	const out = ['']
	out.push(top('ПОД СБРОС', `${chosen.length} задач(и)`))
	out.push(line())
	for (const { pack, task } of chosen.slice(0, 30)) {
		out.push(
			line(
				palette.accent(padEnd(task.id, 10)) +
					palette.surface(padEnd(pack.code, 6)) +
					palette.ink(task.title),
			),
		)
	}
	if (chosen.length > 30) out.push(line(palette.surface(`… и ещё ${chosen.length - 30}`)))
	out.push(line())
	console.log(out.join('\n'))

	if (flags.has('--dry') || flags.has('-d')) {
		console.log(end(palette.surface('--dry: файлы не тронуты.')))
		console.log('')
		return
	}

	const skipAsk = flags.has('-y') || flags.has('--yes')
	if (!skipAsk && !(await confirm(chosen.length))) {
		console.log(end(palette.surface('Отменено.')))
		console.log('')
		return
	}

	let restored = 0
	for (const { task } of chosen) {
		const entry = stubs.tasks[task.id]
		fs.writeFileSync(path.join(ROOT, entry.file), entry.content)
		restored += 1
	}

	console.log(line(palette.mint('✓ ') + palette.ink(`сброшено: ${restored}`)))
	console.log(end(palette.surface('прогресс по этим задачам устарел — `yarn ok` пересчитает')))
	console.log()
}

main()
