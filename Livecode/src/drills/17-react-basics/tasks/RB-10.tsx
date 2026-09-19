import type { ReactNode } from 'react'

// #region RB-10 | Подъём состояния | ★★☆
/**
 * NumberInput — контролируемый инпут БЕЗ собственного состояния: value и onChange приходят сверху.
 * SumBox держит два значения и выводит «Сумма: N». Нечисловой ввод считать нулём.
 * Подписи инпутов: «Первое» и «Второе».
 */
export function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	return <label>заглушка</label>
}
export function SumBox() {
	return <div>заглушка</div>
}
// #endregion
