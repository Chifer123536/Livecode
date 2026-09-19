import { todo } from '../../../shared/kit'

// #region FUN-02 | Генератор идентификаторов | ★☆☆
/**
 * Каждый вызов возвращает следующий id с префиксом.
 *
 *   const nextId = createIdGenerator('user')
 *   nextId() → 'user-1', nextId() → 'user-2'
 */
export const createIdGenerator = (prefix: string): (() => string) => todo()
// #endregion
