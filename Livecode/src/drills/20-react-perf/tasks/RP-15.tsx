import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-15 | Производное состояние без эффекта | ★★☆
/**
 * Показать отфильтрованный список. Реализовать БЕЗ useEffect и БЕЗ второго useState:
 * фильтрация — производное значение.
 *
 * Разметка: инпут «Фильтр», список подходящих <li>, абзац «Найдено: N».
 * Тест проверит, что после ввода результат корректен уже в первом же рендере,
 * то есть не появляется через дополнительный проход.
 */
export function FilteredList({ items, onRender }: { items: string[] } & Counted) {
	return <div>заглушка</div>
}
// #endregion
