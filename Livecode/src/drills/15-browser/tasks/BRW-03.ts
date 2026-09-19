import { todo } from '../../../shared/kit'

// #region BRW-03 | Разбор хэш-маршрута | ★★★
/**
 * Старый добрый хэш-роутинг: путь, параметры по шаблону и query.
 *
 *   parseHashRoute('#/users/5?tab=info', '/users/:id')
 *     → { path: '/users/5', params: { id: '5' }, query: { tab: 'info' } }
 *   шаблон не подошёл → params: {}
 */
export type Route = { path: string; params: Record<string, string>; query: Record<string, string> }
export const parseHashRoute = (hash: string, template: string): Route => todo()
// #endregion
