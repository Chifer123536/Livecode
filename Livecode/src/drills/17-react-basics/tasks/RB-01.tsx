import type { ReactNode } from 'react'

// #region RB-01 | Пропс в разметку | ★☆☆
/**
 * Вывести <p>Привет, {name}!</p>.
 * Ровно один абзац, текст полностью совпадает с шаблоном.
 *
 * Примеры:
 *   <Hello name="мир" /> → «Привет, мир!»
 */
export function Hello({ name }: { name: string }) {
	return <p>заглушка</p>
}
// #endregion
