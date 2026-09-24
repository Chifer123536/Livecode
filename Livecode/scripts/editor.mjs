/**
 * Открытие файла в VS Code на нужной строке. Общее для `yarn go` и меню.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/** Первый существующий файл с таким именем в PATH. */
function inPath(name) {
	for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
		if (!dir) continue
		const full = path.join(dir, name)
		if (fs.existsSync(full)) return full
	}
	return null
}

let resolved

/**
 * Чем открывать файл.
 *
 * На Windows `code` — это .cmd-обёртка, а её node без `shell: true` запускать
 * отказывается. Сам же `shell: true` с аргументами печатает предупреждение
 * DEP0190 прямо в вывод команды. Поэтому обёртка не запускается, а читается:
 * из неё берутся путь до Code.exe и путь до cli.js (он с версионным хешем,
 * угадывать его нельзя). Дальше запускается ровно то же, что сделал бы .cmd.
 */
export function findEditor() {
	if (resolved !== undefined) return resolved
	resolved = locate()
	return resolved
}

function locate() {
	if (process.platform !== 'win32') return { command: 'code', args: [] }

	const wrapper = inPath('code.cmd')
	const bin = wrapper ? path.dirname(wrapper) : null
	const roots = [
		bin ? path.dirname(bin) : null,
		path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Microsoft VS Code'),
		path.join(process.env.ProgramFiles ?? '', 'Microsoft VS Code'),
	].filter(Boolean)

	const root = roots.find(entry => fs.existsSync(path.join(entry, 'Code.exe')))
	if (!root) return null
	const exe = path.join(root, 'Code.exe')

	if (wrapper) {
		try {
			const cli = fs
				.readFileSync(wrapper, 'utf8')
				.match(/"%~dp0(.+?cli\.js)"/i)?.[1]
				?.replace(/\//g, '\\')
			const full = cli ? path.resolve(bin, cli) : null
			if (full && fs.existsSync(full)) {
				return { command: exe, args: [full], env: { ELECTRON_RUN_AS_NODE: '1' } }
			}
		} catch {
			/* обёртку не прочитать — ниже запасной путь */
		}
	}

	// Обёртки нет или она другого вида — GUI понимает те же аргументы сам.
	return { command: exe, args: [] }
}

/**
 * Открыть файл на строке. Процесс редактора отвязан от терминала полностью:
 * без консоли, без общих дескрипторов и без группы Ctrl+C — терминал о нём не знает.
 * Возвращает false, если редактор не найден или не запустился синхронно.
 */
export function openInEditor(file, lineNumber = 1) {
	const editor = findEditor()
	if (!editor) return false
	try {
		const child = spawn(editor.command, [...editor.args, '-g', `${file}:${lineNumber}`], {
			stdio: 'ignore',
			detached: true,
			windowsHide: true,
			env: { ...process.env, ...editor.env },
		})
		child.on('error', () => {})
		child.unref()
		return true
	} catch {
		return false
	}
}
