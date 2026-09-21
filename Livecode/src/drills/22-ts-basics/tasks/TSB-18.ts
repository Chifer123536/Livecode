import { todo } from '../../../shared/kit'

// #region TSB-18 | keyof и доступ по ключу | ★★☆
/**
 * Собрать значения одного поля из массива объектов.
 * Ключ должен проверяться компилятором: pluck(users, 'нет-такого') обязано не собраться.
 * Тип результата — массив значений именно этого поля.
 *
 * Примеры:
 *   pluck([{ id: 1 }, { id: 2 }], 'id') → [1, 2]
 */
export const pluck = <T, K extends keyof T>(list: T[], key: K): T[K][] => todo()
// #endregion
