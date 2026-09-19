import type { ReactNode } from 'react'

// #region RP-04 | Дорогое вычисление | ★★☆
/**
 * Компонент принимает numbers и text. При вводе текста сумма чисел
 * пересчитываться НЕ должна.
 * Разметка: инпут с подписью «Текст» и абзац «Сумма: N».
 * calculate вызывается ровно там, где считается сумма, — тест считает его вызовы.
 */
export function ExpensiveSum({ numbers, calculate }: { numbers: number[]; calculate: () => void }) {
	return <div>заглушка</div>
}
// #endregion
