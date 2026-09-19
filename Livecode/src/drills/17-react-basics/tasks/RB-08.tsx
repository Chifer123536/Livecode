import type { ReactNode } from 'react'

// #region RB-08 | Пустое состояние | ★☆☆
/**
 * Тот же список, но если items пуст — вместо <ul> показать <p>Список пуст</p>.
 * Пустой <ul> в DOM оставаться не должен.
 */
export function ListWithEmpty({ items }: { items: string[] }) {
	return <div>заглушка</div>
}
// #endregion
