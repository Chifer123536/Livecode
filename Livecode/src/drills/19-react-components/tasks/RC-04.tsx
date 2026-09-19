import type { ReactNode } from 'react'

// #region RC-04 | Форма регистрации | ★★★
/**
 * Поля: «Email», «Пароль», «Повтор пароля». Правила:
 *  - email содержит @ и точку после него;
 *  - пароль минимум 6 символов;
 *  - повтор совпадает с паролем.
 * Ошибка поля показывается ТОЛЬКО после blur или после попытки сабмита,
 * выводится как <p role="alert">{текст}</p>, у поля aria-invalid="true".
 * Кнопка «Зарегистрироваться» задизейблена, пока форма невалидна.
 * Успешный сабмит вызывает onSubmit со значениями и очищает форму.
 * errors — производное от values, а не отдельное состояние.
 */
export type SignupValues = { email: string; password: string; confirm: string }
export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
	return <form>заглушка</form>
}
// #endregion
