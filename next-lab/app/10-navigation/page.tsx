import { Suspense } from 'react'
import { NavDemo } from './nav-demo'

/**
 * ДЕМО 10 — НАВИГАЦИЯ
 *
 * <Suspense> вокруг NavDemo обязателен: внутри используется useSearchParams,
 * а он делает компонент динамическим. Без границы Suspense сборка упадёт
 * с ошибкой про отсутствующий suspense boundary.
 *
 * Чем <Link> лучше <a>:
 *  - клиентская навигация без полной перезагрузки;
 *  - префетч страницы, когда ссылка попадает во вьюпорт;
 *  - сохраняется состояние layout выше по дереву.
 * <a href> делает полную перезагрузку и теряет всё состояние приложения.
 */
export default function NavigationDemo() {
	return (
		<>
			<h1>Навигация</h1>
			<p className="lead">Link, usePathname, useSearchParams, useRouter.</p>

			<Suspense fallback={<div className="card">Читаю адрес…</div>}>
				<NavDemo />
			</Suspense>

			<h2>Что спросят</h2>
			<ul>
				<li>
					Откуда импортировать хуки роутера? Из <code>next/navigation</code>.
					<code>next/router</code> — это Pages Router, в App Router он не работает.
				</li>
				<li>
					Разница <code>push</code> и <code>replace</code>? Первый добавляет запись в историю,
					второй заменяет текущую.
				</li>
				<li>
					Что делает <code>router.refresh()</code>? Перезапрашивает серверные данные текущего
					маршрута, не теряя состояние клиентских компонентов.
				</li>
			</ul>
		</>
	)
}
