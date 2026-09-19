import type { ReactNode } from 'react'

// #region RC-03 | Загрузка с отменой | ★★★
/**
 * Инпут «Пользователь» + загрузка через переданную функцию search(query, signal).
 * Состояния строго разделены:
 *  - идёт загрузка → <p>Загрузка…</p>;
 *  - ошибка → <p role="alert">{message}</p> и кнопка «Повторить»;
 *  - успех → <ul> с результатами, пусто → <p>Никого не нашли</p>.
 * При смене запроса предыдущий запрос отменяется через AbortController,
 * ответ отменённого запроса в состояние не попадает, AbortError не показывается как ошибка.
 * Пустой запрос не отправляется — показывать <p>Введите запрос</p>.
 */
export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>
export function UserSearch({ search }: { search: SearchFn }) {
	return <div>заглушка</div>
}
// #endregion
