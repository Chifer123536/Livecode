import type { Metadata } from 'next'

/**
 * ДЕМО 07 — МЕТАДАННЫЕ
 *
 * Два способа задать <head>:
 *  1. Статически — экспорт `metadata`, когда значения известны заранее.
 *  2. Динамически — `generateMetadata`, когда заголовок зависит от данных (см. демо 05).
 *
 * Вручную писать <title> и <meta> в JSX не нужно: Next собирает их сам,
 * дедуплицирует и правильно склеивает по цепочке layout → page.
 *
 * `template` в корневом layout добавляет суффикс ко всем дочерним заголовкам:
 * title: 'Метаданные' превращается в 'Метаданные · next-lab'.
 * `absolute` позволяет шаблон обойти.
 */

export const metadata: Metadata = {
	title: 'Метаданные',
	description: 'Как App Router собирает head',
	openGraph: {
		title: 'next-lab — метаданные',
		description: 'Демонстрация metadata API',
		type: 'article',
	},
	robots: { index: false, follow: false },
}

export default function MetadataDemo() {
	return (
		<>
			<h1>Метаданные</h1>
			<p className="lead">Открой вкладку и посмотри на её заголовок — там сработал шаблон из layout.</p>

			<div className="card">
				<code>title</code> здесь — строка <code>'Метаданные'</code>, а в корневом layout задан
				<code>template: '%s · next-lab'</code>. Итог: <code>Метаданные · next-lab</code>.
			</div>

			<h2>Что спросят</h2>
			<ul>
				<li>
					Чем <code>metadata</code> отличается от <code>generateMetadata</code>? Второй — async
					и видит <code>params</code>, поэтому годится для страниц сущностей.
				</li>
				<li>
					Можно ли экспортировать <code>metadata</code> из клиентского компонента? Нет — только из
					серверного.
				</li>
				<li>
					Файлы <code>icon.png</code>, <code>opengraph-image.tsx</code>, <code>sitemap.ts</code>,
					<code>robots.ts</code> в <code>app/</code> — тоже часть metadata API.
				</li>
			</ul>
		</>
	)
}
