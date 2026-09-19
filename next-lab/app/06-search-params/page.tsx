import Link from 'next/link'
import { getPosts } from '@/app/lib/db'

/**
 * ДЕМО 06 — SEARCHPARAMS
 *
 * `searchParams` — тоже ПРОМИС, и это обычный объект, а не URLSearchParams.
 * Повторяющийся ключ (?tag=a&tag=b) приходит массивом, поэтому тип значения —
 * `string | string[] | undefined`, и это надо обрабатывать.
 *
 * Важное следствие: чтение searchParams делает страницу ДИНАМИЧЕСКОЙ.
 * Её нельзя отрендерить заранее — значения известны только в момент запроса.
 *
 * Зачем держать фильтры в адресе, а не в useState:
 *  - ссылку можно переслать, и у получателя откроется тот же экран;
 *  - работают кнопки «назад» и «вперёд»;
 *  - состояние переживает перезагрузку;
 *  - серверный компонент может отфильтровать данные сам, без запроса из браузера.
 */

type Props = { searchParams: Promise<{ q?: string; sort?: string }> }

export default async function SearchParamsDemo({ searchParams }: Props) {
	const { q = '', sort = 'desc' } = await searchParams
	const posts = await getPosts()

	const filtered = posts
		.filter(post => post.title.toLowerCase().includes(q.toLowerCase()))
		.sort((a, b) => (sort === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt))

	return (
		<>
			<h1>Фильтры в адресе</h1>
			<p className="lead">
				Текущий запрос: <code>q={q || '—'}</code> <code>sort={sort}</code>
			</p>

			{/* Обычная HTML-форма с method=get: браузер сам соберёт строку запроса.
			    Работает даже без JavaScript — ровно так делали до эпохи SPA. */}
			<form method="get" className="card">
				<input name="q" defaultValue={q} placeholder="поиск по заголовку" />
				<select name="sort" defaultValue={sort}>
					<option value="desc">сначала новые</option>
					<option value="asc">сначала старые</option>
				</select>
				<button type="submit">Применить</button>
			</form>

			<div className="card">
				Быстрые ссылки: <Link href="/06-search-params?q=компонент">?q=компонент</Link>{' '}
				<Link href="/06-search-params?sort=asc">?sort=asc</Link>{' '}
				<Link href="/06-search-params">сбросить</Link>
			</div>

			<h2>Найдено: {filtered.length}</h2>
			{filtered.map(post => (
				<div className="card" key={post.id}>
					{post.title}
				</div>
			))}
		</>
	)
}
