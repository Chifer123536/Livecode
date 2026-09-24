#!/usr/bin/env node
/**
 * Подключение тренажёра к PowerShell: шпаргалка при входе в папку и Tab-дополнение.
 *
 *   yarn shell           подключить
 *   yarn shell --off     отключить и больше не подключать автоматически
 *
 * Автоматически вызывается из `yarn install` и при первом запуске меню. Решение
 * запоминается в `.ui.json` (поле shell): выключенное руками назад не включается.
 *
 * В профиль дописывается блок между метками. Путь к профилю спрашивается у самого
 * PowerShell: папка «Документы» бывает перенесена в OneDrive, угадывать её нельзя.
 */
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { applyUi, ROOT, saveUi, ui } from '../lib.mjs'

const run = promisify(execFile)

const SCRIPT = path.join(ROOT, 'scripts', 'shell', 'livecode.ps1')
const BEGIN = '# >>> livecode trainer >>>'
const END = '# <<< livecode trainer <<<'

/** Блок только из ASCII: профиль может оказаться в любой кодировке. */
const block = () =>
	[BEGIN, `if (Test-Path '${SCRIPT}') { . '${SCRIPT}' }`, END].join('\r\n') + '\r\n'

/** Профили установленных PowerShell: Windows PowerShell 5 и, если есть, PowerShell 7. */
async function profiles() {
	const found = []
	for (const shell of ['powershell.exe', 'pwsh.exe']) {
		try {
			const { stdout } = await run(
				shell,
				['-NoProfile', '-NonInteractive', '-Command', '$PROFILE.CurrentUserCurrentHost'],
				{ windowsHide: true, timeout: 15_000 },
			)
			const file = stdout.trim()
			if (file) found.push(file)
		} catch {
			/* этой оболочки нет — пропускаем */
		}
	}
	return [...new Set(found)]
}

/** Текст профиля с учётом кодировки: Блокнот и New-Item пишут и UTF-16. */
function readProfile(file) {
	if (!fs.existsSync(file)) return { text: '', encoding: 'utf8', bom: true }
	const bytes = fs.readFileSync(file)
	if (bytes[0] === 0xff && bytes[1] === 0xfe)
		return { text: bytes.subarray(2).toString('utf16le'), encoding: 'utf16le', bom: true }
	if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
		return { text: bytes.subarray(3).toString('utf8'), encoding: 'utf8', bom: true }
	return { text: bytes.toString('utf8'), encoding: 'utf8', bom: false }
}

function writeProfile(file, { text, encoding, bom }) {
	fs.mkdirSync(path.dirname(file), { recursive: true })
	const body = Buffer.from(text, encoding)
	const mark = !bom
		? Buffer.alloc(0)
		: encoding === 'utf16le'
			? Buffer.from([0xff, 0xfe])
			: Buffer.from([0xef, 0xbb, 0xbf])
	fs.writeFileSync(file, Buffer.concat([mark, body]))
}

const strip = text =>
	text.replace(new RegExp(`\\r?\\n?${BEGIN}[\\s\\S]*?${END}\\r?\\n?`, 'g'), '\r\n').trimEnd()

/** Подключить. Возвращает список профилей, куда блок был добавлен или уже стоял. */
export async function install() {
	if (process.platform !== 'win32') return []
	const files = await profiles()
	for (const file of files) {
		const current = readProfile(file)
		if (current.text.includes(BEGIN)) continue
		const text = current.text.trimEnd()
		writeProfile(file, { ...current, text: (text ? text + '\r\n\r\n' : '') + block() })
	}
	applyUi({ shell: true })
	saveUi()
	return files
}

/** Отключить и запомнить это. */
export async function uninstall() {
	if (process.platform !== 'win32') return []
	const files = await profiles()
	for (const file of files) {
		const current = readProfile(file)
		if (!current.text.includes(BEGIN)) continue
		writeProfile(file, { ...current, text: strip(current.text) + '\r\n' })
	}
	applyUi({ shell: false })
	saveUi()
	return files
}

/**
 * Подключить, если об этом ещё не договаривались. Вызывается сам — из `yarn install`
 * и при старте меню. Возвращает true, только если подключение случилось сейчас.
 */
export async function ensure() {
	if (process.platform !== 'win32' || ui.shell !== undefined) return false
	const files = await install()
	return files.length > 0
}

// ── запуск командой ────────────────────────────────────────────────────

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const flags = new Set(process.argv.slice(2))
	const quiet = flags.has('--quiet')

	if (process.platform !== 'win32') {
		if (!quiet) console.log('\n  Подключение к оболочке сделано под PowerShell на Windows.\n')
		process.exit(0)
	}

	if (flags.has('--auto')) {
		// Хук postinstall: молча подключить, если решения ещё не было. Ошибка не валит установку.
		try {
			if ((await ensure()) && !quiet)
				console.log(
					'\n  livecode: шпаргалка и Tab подключены к PowerShell — откроются в новом окне.\n',
				)
		} catch {
			/* установка зависимостей важнее */
		}
		process.exit(0)
	}

	const files = flags.has('--off') ? await uninstall() : await install()
	console.log('')
	if (files.length === 0) {
		console.log('  PowerShell не найден — подключать некуда.')
	} else if (flags.has('--off')) {
		console.log('  Шпаргалка и Tab отключены. Обратно: yarn shell')
		for (const file of files) console.log(`    ${file}`)
	} else {
		console.log('  Шпаргалка и Tab подключены. Сработают в новом окне терминала')
		console.log('  (или сразу в этом: . $PROFILE). Отключить: yarn shell --off')
		for (const file of files) console.log(`    ${file}`)
	}
	console.log('')
}
