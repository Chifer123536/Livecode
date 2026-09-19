import { todo } from '../../../shared/kit'

// #region ASY-05 | Свой Promise.all | ★★★
/**
 * Реализовать Promise.all руками, без вызова Promise.all.
 *  - результаты в порядке входа, даже если резолвились вразнобой;
 *  - первый reject отклоняет общий промис;
 *  - пустой массив резолвится пустым массивом немедленно.
 */
export const myAll = <T>(promises: Array<Promise<T>>): Promise<T[]> => todo()
// #endregion
