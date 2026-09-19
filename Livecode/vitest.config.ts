import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

/**
 * Режим `--mode solutions` подменяет импорт './tasks' на './solution' в тестовых файлах.
 * Так проверяется, что сами тесты корректны: `yarn verify` должен быть полностью зелёным.
 */
function useSolutions(): Plugin {
	return {
		name: 'drills:use-solutions',
		enforce: 'pre',
		resolveId(source, importer) {
			if (!importer || source !== './tasks') return null
			if (!/\.test\.tsx?$/.test(importer)) return null
			// Расширение теста и решения могут не совпадать (хуки — .ts, тесты — .tsx),
			// поэтому выбираем существующий файл, а не угадываем по импортёру.
			const dir = path.dirname(importer)
			for (const ext of ['.ts', '.tsx']) {
				const candidate = path.join(dir, `solution${ext}`)
				if (fs.existsSync(candidate)) return candidate
			}
			return null
		},
	}
}

export default defineConfig(({ mode }) => ({
	plugins: [react(), ...(mode === 'solutions' ? [useSolutions()] : [])],
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/drills/**/*.test.{ts,tsx}'],
		testTimeout: 10_000,
		// В стеке нужен только свой код: кадры из vitest и из заглушки todo() лишь мешают читать.
		onStackTrace: (_error, { file }) =>
			!file.includes('node_modules') && !file.replace(/\\/g, '/').includes('src/shared/kit'),
	},
}))
