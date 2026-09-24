/**
 * Карточка задачи: условие, что заполнить, приёмка. Общая для `yarn go` и меню.
 */
import { entryOf, fileOf, isTaskStale, palette, relativePath, statusOf } from './lib.mjs'
import { code, line, markWord, node, stars, top } from './ui.mjs'

/** Текст условия из комментария задачи, без звёздочек и обрамления. */
export function condition(body) {
	const doc = body.match(/\/\*\*([\s\S]*?)\*\//)
	if (!doc) return ''
	return doc[1]
		.split('\n')
		.map(entry => entry.replace(/^\s*\*\s?/, ''))
		.join('\n')
		.trim()
}

/** Сигнатура: всё, что не комментарий. Это и есть то, что нужно заполнить. */
export function signature(body) {
	return body
		.replace(/\/\*\*[\s\S]*?\*\//, '')
		.split('\n')
		.filter(entry => entry.trim() && !entry.trim().startsWith('//'))
		.join('\n')
		.trim()
}

/** Тело describe без самой обёртки — остаются только проверки. */
export function checks(body) {
	return body
		.split('\n')
		.slice(1, -1)
		.map(entry => entry.replace(/^\t/, ''))
		.join('\n')
		.trim()
}

/** Состояние задачи одной строкой: сдана, частично, изменена после проверки. */
export function stateLine(progress, pack, task) {
	const entry = entryOf(progress, task.id)
	if (isTaskStale(progress, task.id, fileOf(pack, task)))
		return palette.amber('перепроверить') + palette.surface('  файл изменён после проверки')
	if (!entry) return palette.surface('не проверялась')
	return (
		markWord(statusOf(progress, task.id)) +
		(entry.total > 0 ? palette.surface(`  ${entry.passed}/${entry.total}`) : '')
	)
}

/** Карточка строками для терминала. `subtitle` — что стоит справа от заголовка. */
export function renderCard({ pack, task, progress, subtitle }) {
	const test = pack.tests.get(task.id)
	const out = []

	out.push(top(`${task.id} · ${task.title}`, subtitle ?? `${pack.code} · ${pack.title}`))
	out.push(line(stars(task.stars) + '   ' + palette.surface(relativePath(fileOf(pack, task)))))
	out.push(line(stateLine(progress, pack, task)))
	out.push(line())

	out.push(node('ЧТО НАДО СДЕЛАТЬ'))
	out.push(line())
	for (const text of condition(task.body).split('\n')) out.push(line(palette.ink(text)))
	out.push(line())

	out.push(node('ЗАПОЛНИТЬ'))
	out.push(line())
	out.push(...code(signature(task.body)))
	out.push(line())

	if (test) {
		out.push(node('ПРИЁМКА'))
		out.push(line(palette.surface('эти проверки должны стать зелёными')))
		out.push(line())
		out.push(...code(checks(test.body), palette.faint))
		out.push(line())
	}

	return out
}
