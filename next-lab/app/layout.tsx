import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

/**
 * КОРНЕВОЙ LAYOUT — обязателен, и только он содержит <html> и <body>.
 * Оборачивает все страницы, при навигации НЕ перемонтируется:
 * состояние внутри него переживает переходы между роутами.
 * Это серверный компонент, поэтому здесь нельзя useState и обработчики.
 */

export const metadata: Metadata = {
	title: { default: 'next-lab', template: '%s · next-lab' },
	description: 'Тренажёр по основам Next.js App Router',
}

const DEMOS = [
	['/01-server-component', 'Серверный компонент'],
	['/02-client-component', 'Клиентский компонент'],
	['/03-streaming', 'loading.tsx и стриминг'],
	['/04-error', 'error.tsx'],
	['/05-posts', 'Динамический маршрут'],
	['/06-search-params', 'searchParams'],
	['/07-metadata', 'Метаданные'],
	['/08-server-action', 'Server Action'],
	['/09-action-state', 'useActionState'],
	['/10-navigation', 'Навигация'],
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body>
				<div className="shell">
					<aside>
						<Link href="/" className="brand">
							next-lab
						</Link>
						<nav>
							{DEMOS.map(([href, title]) => (
								<Link key={href} href={href}>
									{title}
								</Link>
							))}
						</nav>
					</aside>
					<main>{children}</main>
				</div>
			</body>
		</html>
	)
}
