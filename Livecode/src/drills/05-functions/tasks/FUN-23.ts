import { todo } from '../../../shared/kit'

// #region FUN-23 | Композиция с общим контекстом | ★★☆
/**
 * Применить список функций к значению по очереди, собирая по пути лог шагов.
 * Возвращает { value, steps }, где steps — имена применённых функций.
 */
export type Step = (value: number) => number
export const runPipeline = (value: number, steps: Step[]): { value: number; steps: string[] } => todo()
// #endregion
