import { Suspense } from 'react'
import { getPosts } from '@/app/lib/db'

/**
 * ДЕМО 03 — LOADING.TSX И СТРИМИНГ
 *
 * Два уровня одного и того же механизма:
 *  1. `loading.tsx` рядом с `page.tsx` — Suspense на весь сегмент.
 *     Показывается, пока страница целиком не догрузилась.
 *  2. Явный <Suspense> вокруг медленного куска — остальная страница отдаётся сразу,
 *     а этот блок дотекает позже. Это и есть стриминг.
 *
 * Зачем: пользователь видит оболочку за сотни миллисекунд, а не белый экран,
 * пока самый медленный запрос страницы не закончится.
 *
 * Важно: для стриминга медленная часть должна быть ОТДЕЛЬНЫМ компонентом.
 * Если await стоит в теле самой страницы, ждать придётся всю страницу.
 */

async function SlowBlock() {
	const posts = await getPosts(1500)
	return (
		<div className="card">
			<strong className="ok">Готово</strong>
			<ul>
				{posts.map(post => (
					<li key={post.id}>{post.title}</li>
				))}
			</ul>
		</div>
	)
}

async function FastBlock() {
	const posts = await getPosts(100)
	return <div className="card">Быстрый блок: записей {posts.length}</div>
}

export default function StreamingDemo() {
	return (
		<>
			<h1>Отчёт</h1>
			<p className="lead">Заголовок виден сразу, медленный блок дотекает отдельно.</p>

			<Suspense fallback={<div className="card">Быстрый блок грузится…</div>}>
				<FastBlock />
			</Suspense>

			<Suspense
				fallback={
					<div className="card">
						<div className="skeleton" style={{ width: '70%' }} />
						<div className="skeleton" style={{ width: '45%' }} />
					</div>
				}
			>
				<SlowBlock />
			</Suspense>

			<div className="note">
				Обнови страницу и посмотри: сначала появляются заголовок и быстрый блок, через полторы
				секунды — медленный. Страница не ждала самого долгого запроса.
			</div>

			<h2>Что спросят</h2>
			<ul>
				<li>
					Чем <code>loading.tsx</code> отличается от <code>&lt;Suspense&gt;</code>? Первый — сахар
					над вторым на уровне сегмента маршрута.
				</li>
				<li>Почему стриминг улучшает метрики? Раньше приходит первый байт и первая отрисовка.</li>
				<li>
					Что будет, если await написать прямо в странице? Весь сегмент станет медленным,
					стриминга не получится.
				</li>
			</ul>
		</>
	)
}
