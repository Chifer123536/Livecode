import type { ReactNode } from 'react'

// #region RC-12 | Пошаговая форма | ★★★
/**
 * Три шага: «Контакты» (поле «Имя»), «Адрес» (поле «Город»), «Готово».
 *  - заголовок <h2> с названием текущего шага и <p>Шаг N из 3</p>;
 *  - кнопки «Назад» (задизейблена на первом шаге) и «Далее»;
 *  - «Далее» не работает, пока поле текущего шага пустое;
 *  - на последнем шаге вместо «Далее» кнопка «Отправить», она зовёт onSubmit со всеми данными;
 *  - при возврате назад введённые данные сохраняются.
 */
export type WizardValues = { name: string; city: string }
export function MultiStepForm({ onSubmit }: { onSubmit: (values: WizardValues) => void }) {
	return <div>заглушка</div>
}
// #endregion
