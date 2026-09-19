import type { ReactNode } from 'react'

// #region RC-16 | Поле количества | ★★☆
/**
 * Управляемый счётчик: кнопки «−» и «+» (aria-label «Уменьшить» и «Увеличить»),
 * между ними инпут с подписью «Количество».
 *  - значение зажимается в [min, max], кнопки на границах задизейблены;
 *  - в инпут можно ввести только цифры, нечисловой ввод игнорируется;
 *  - пустой инпут не ломает компонент (трактуется как min).
 */
export function QuantityInput({
	value,
	onChange,
	min = 1,
	max = 99,
}: {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
}) {
	return <div>заглушка</div>
}
// #endregion
