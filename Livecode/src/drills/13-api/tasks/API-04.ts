import { todo } from '../../../shared/kit'

// #region API-04 | snake_case в camelCase | ★★★
/**
 * Рекурсивно по объектам и массивам. Значения не трогаем, только ключи.
 * Даты и прочие не-простые объекты не разбирать.
 *
 *   camelizeKeys({ user_name: 'Ян', items: [{ created_at: 1 }] })
 *
 * Примеры:
 *     → { userName: 'Ян', items: [{ createdAt: 1 }] }
 */
export const camelizeKeys = (value: unknown): unknown => todo()
// #endregion
