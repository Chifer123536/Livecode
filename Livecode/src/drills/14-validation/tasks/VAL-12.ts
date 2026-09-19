import { todo } from '../../../shared/kit'
import type { Validator } from './_pack'

// #region VAL-12 | Композиция валидаторов | ★★☆
/**
 * Применять по очереди и вернуть ПЕРВУЮ ошибку: показывать пользователю пять ошибок
 * на одном поле бессмысленно. Проверки после первой ошибки не выполняются.
 */
export const composeValidators = <T>(validators: Array<Validator<T>>): Validator<T> => todo()
// #endregion
