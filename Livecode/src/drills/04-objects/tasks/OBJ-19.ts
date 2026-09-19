import { todo } from '../../../shared/kit'

// #region OBJ-19 | Иммутабельное обновление по пути | ★★★
/**
 * Обновить значение по пути функцией, не мутируя исходный объект.
 * Копируются только узлы ВДОЛЬ пути, остальные ветки переиспользуются по ссылке —
 * именно так работают иммутабельные апдейты в Redux.
 *
 *   updateIn({ a: { b: 1 }, keep: {} }, 'a.b', n => n + 1)
 */
export const updateIn = <T extends object>(obj: T, path: string, updater: (value: unknown) => unknown): T => todo()
// #endregion
