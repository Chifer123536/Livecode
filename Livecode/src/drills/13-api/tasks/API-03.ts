import { todo } from '../../../shared/kit'

// #region API-03 | Сборка URL | ★★☆
/**
 * Склеить базу, путь и параметры без двойных слэшей и лишнего '?'.
 *
 * Примеры:
 *   buildUrl('https://api.dev/', '/users', { page: 2 }) → 'https://api.dev/users?page=2'
 *   buildUrl('https://api.dev', 'users')                → 'https://api.dev/users'
 */
export const buildUrl = (base: string, path: string, params?: Record<string, unknown>): string => todo()
// #endregion
