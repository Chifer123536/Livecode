/**
 * `loading.tsx` — соглашение App Router.
 * Next оборачивает `page.tsx` этого сегмента в <Suspense fallback={<Loading />}>.
 * Никакого useState с флагом isLoading писать не нужно: оболочка страницы
 * (layout, навигация) уходит пользователю мгновенно, а содержимое дотекает потом.
 */
export default function Loading() {
	return (
		<>
			<h1>Отчёт</h1>
			<p className="lead">Считаем…</p>
			<div className="card">
				<div className="skeleton" style={{ width: '60%' }} />
				<div className="skeleton" style={{ width: '85%' }} />
				<div className="skeleton" style={{ width: '40%' }} />
			</div>
		</>
	)
}
