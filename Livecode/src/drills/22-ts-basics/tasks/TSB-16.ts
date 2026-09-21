import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TSB-16 | as const и вывод литералов | ★★☆
/**
 * Сейчас ROLES выводится как string[], поэтому Role это просто string.
 * Нужно, чтобы Role стал объединением 'admin' | 'user' | 'guest'.
 * Дальше — проверка, что произвольная строка является ролью.
 *
 * Примеры:
 *   isRole('admin') → true
 *   isRole('boss')  → false
 */
export const ROLES = ['admin', 'user', 'guest']
export type Role = (typeof ROLES)[number]

export const isRole = (value: string): value is Role => todo()

type _TSB16 = Expect<Equal<Role, 'admin' | 'user' | 'guest'>>
// #endregion
