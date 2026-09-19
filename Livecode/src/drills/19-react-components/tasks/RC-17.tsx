import type { ReactNode } from 'react'

// #region RC-17 | Надёжность пароля | ★★☆
/**
 * Инпут «Пароль» и индикатор под ним.
 * Балл считается по признакам: длина ≥ 8, есть строчная, есть заглавная, есть цифра, есть спецсимвол.
 *
 * Примеры:
 *  - 0-2 балла → «Слабый», 3-4 → «Средний», 5 → «Надёжный»;
 *  - индикатор: <div role="progressbar" aria-valuenow={балл} aria-valuemin="0" aria-valuemax="5">;
 *  - рядом <p> с текстовой оценкой; при пустом пароле — <p>Введите пароль</p>.
 */
export function PasswordStrength() {
	return <div>заглушка</div>
}
// #endregion
