import { todo } from '../../../shared/kit'

// #region FUN-17 | Модуль на замыкании | ★★★
/**
 * Паттерн «модуль»: приватные данные и публичный интерфейс.
 * createTodoModule возвращает { add, remove, list }, где сам массив наружу не утекает:
 * list() обязан отдавать КОПИЮ, иначе снаружи можно будет мутировать приватное состояние.
 */
export type TodoModule = { add: (text: string) => void; remove: (text: string) => void; list: () => string[] }
export const createTodoModule = (): TodoModule => todo()
// #endregion
