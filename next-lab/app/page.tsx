import Link from 'next/link'

/**
 * Это `app/page.tsx` — страница корневого маршрута `/`.
 * Файл `page` делает сегмент публично доступным: без него по адресу будет 404.
 * По умолчанию это СЕРВЕРНЫЙ компонент: код выполняется на сервере и в бандл не попадает.
 */

const DEMOS: Array<[string, string, string]> = [
	['/01-server-component', 'Серверный компонент', 'fetch прямо в компоненте, без useEffect'],
	['/02-client-component', 'Клиентский компонент', "когда нужен 'use client' и что ломается без него"],
	['/03-streaming', 'loading.tsx и стриминг', 'Suspense из коробки, мгновенная оболочка страницы'],
	['/04-error', 'error.tsx', 'граница ошибок и кнопка reset'],
	['/05-posts', 'Динамический маршрут', 'params как Promise, notFound(), generateStaticParams'],
	['/06-search-params', 'searchParams', 'фильтры в адресной строке, динамический рендер'],
	['/07-metadata', 'Метаданные', 'статические и через generateMetadata'],
	['/08-server-action', 'Server Action', 'форма, которая работает без клиентского JS'],
	['/09-action-state', 'useActionState', 'pending, ошибки валидации, прогрессивное улучшение'],
	['/10-navigation', 'Навигация', 'Link, useRouter, usePathname, useSearchParams'],
]

export default function Home() {
	return (
		<>
			<h1>next-lab</h1>
			<p className="lead">Десять работающих примеров по основам App Router. Next 16, React 19.</p>

			<div className="note">
				Порядок работы: открыл страницу → прочитал комментарии в её исходнике → выполнил задание из
				<code>TASKS.md</code> → ответил на вопросы из <code>THEORY.md</code> вслух.
			</div>

			{DEMOS.map(([href, title, about]) => (
				<div className="card" key={href}>
					<Link href={href}>
						<strong>{title}</strong>
					</Link>
					<div style={{ color: 'var(--muted)', fontSize: 13 }}>{about}</div>
					<code>app{href}/page.tsx</code>
				</div>
			))}

			<h2>Ещё в проекте</h2>
			<div className="card">
				<code>app/api/posts/route.ts</code> — Route Handler: GET и POST по адресу <code>/api/posts</code>.
				Открой <Link href="/api/posts">/api/posts</Link>, чтобы увидеть JSON.
			</div>
		</>
	)
}
