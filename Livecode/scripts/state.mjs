/**
 * Состояние тренажёра: какие задачи сданы, какие нет.
 * Источник истины — сами тесты и компилятор, а не галочки руками.
 *
 * Запись прогресса на задачу: { status, passed, total, types, mtime, at }.
 * `mtime` — время файла на момент проверки: по нему видно, что задачу правили после.
 */
import { allTasks, fileOf, mtimeOf, readProgress, statusOf, writeProgress } from './lib.mjs'
import { evaluate } from './engine.mjs'

export const PROGRESS_VERSION = 2

/** Пустой прогресс — с него начинается жизнь без `.progress.json`. */
const blank = () => ({ version: PROGRESS_VERSION, generatedAt: null, tasks: {}, packs: {} })

/** Счётчики по пакам пересчитываются из задач: хранить их отдельно незачем. */
function recountPacks(packs, progress) {
	progress.packs = {}
	for (const pack of packs) {
		const done = [...pack.tasks.keys()].filter(id => statusOf(progress, id) === 'pass').length
		progress.packs[pack.code] = { done, total: pack.tasks.size, dir: pack.name }
	}
	return progress
}

/** Запись о задаче по результату проверки. */
const entryFrom = ({ pack, task, status, stats, typeErrors }) => ({
	status,
	passed: stats?.passed ?? 0,
	total: stats?.total ?? 0,
	types: typeErrors.length,
	mtime: mtimeOf(fileOf(pack, task)),
	at: new Date().toISOString(),
})

/**
 * Вписать результаты проверки в прогресс, не трогая остальные задачи.
 * Так одна быстрая проверка держит картину в актуальном состоянии
 * и полный прогон нужен только для контрольной сверки.
 */
export function recordResults(packs, results) {
	const progress = readProgress() ?? blank()
	progress.version = PROGRESS_VERSION
	progress.tasks ??= {}

	for (const result of results) progress.tasks[result.task.id] = entryFrom(result)

	progress.generatedAt = new Date().toISOString()
	recountPacks(packs, progress)
	writeProgress(progress)
	return progress
}

/**
 * Проверка выбранных задач с записью в прогресс. Общая для `yarn ok` и меню.
 * `whole` — весь тренажёр: один прогон без фильтров дешевле регулярки на сотни имён.
 */
export async function checkTargets(packs, targets, { whole = false } = {}) {
	const started = Date.now()
	const single = targets.length === 1
	const dirs = [...new Set(targets.map(({ pack }) => `src/drills/${pack.name}`))]

	const { results, tests } = await evaluate(targets, {
		dirs: whole ? [] : dirs,
		ids: single ? [targets[0].task.id] : [],
		allTypes: whole,
	})

	const elapsed = ((Date.now() - started) / 1000).toFixed(1)
	// Упавший целиком vitest не повод затирать прогресс пустыми результатами.
	const progress = tests.error ? readProgress() : recordResults(packs, results)
	return { results, error: tests.error, elapsed, progress }
}

/** Полный прогон: все тесты плюс типы всего проекта. Перезаписывает прогресс целиком. */
export async function computeAll(packs) {
	const targets = allTasks(packs)
	const { results, tests, types } = await evaluate(targets, { allTypes: true })

	const progress = blank()
	progress.generatedAt = new Date().toISOString()
	for (const result of results) progress.tasks[result.task.id] = entryFrom(result)
	recountPacks(packs, progress)
	writeProgress(progress)

	const brokenPacks = [
		...new Set(results.filter(r => r.packBroken || r.missing).map(r => r.pack.code)),
	]
	const grandDone = results.filter(r => r.status === 'pass').length

	return {
		progress,
		results,
		brokenPacks,
		grandDone,
		grandTotal: targets.length,
		error: tests.error,
		typesSkipped: types.skipped,
	}
}
