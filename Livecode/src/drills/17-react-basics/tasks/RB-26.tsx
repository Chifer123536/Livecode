import type { ReactNode } from 'react'

// #region RB-26 | key по id, а не по индексу | ★★★
/**
 * Список задач с НЕконтролируемым чекбоксом у каждой (подпись — title) и кнопкой «Удалить первую».
 * key должен быть item.id. С key={index} после удаления первой галочка «переедет»
 * на соседний элемент, потому что React переиспользует DOM-узел по ключу. Тест это ловит.
 */
export type Item = { id: string; title: string }
export function KeyedList({ initial }: { initial: Item[] }) {
	return <div>заглушка</div>
}
// #endregion
