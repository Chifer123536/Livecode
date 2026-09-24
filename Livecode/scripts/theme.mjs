/**
 * Темы оформления. Чистые данные, без импортов — файл читают и lib, и меню.
 *
 * Каждая тема задаёт одиннадцать токенов:
 *   accent  заголовки, коды задач, команды
 *   sky mint amber rose violet   статусы и акценты
 *   snow    текст на подложке, самый яркий
 *   ink     основной текст
 *   faint   второстепенный текст и направляющая
 *   surface третьестепенный: пути, пояснения, пустая часть полосы
 *   chip    заливка плашек с командами
 *   select  заливка выбранной строки меню
 *   panel   заливка фона меню
 *
 * Токены снизу (chip/select/panel) — только фон, поверх них печатается snow.
 */

export const THEMES = [
	{
		id: 'midnight',
		label: 'Полночь',
		about: 'синий акцент на тёмном',
		colors: {
			accent: [125, 189, 255],
			sky: [56, 189, 248],
			mint: [74, 222, 128],
			amber: [252, 211, 77],
			rose: [255, 128, 128],
			violet: [196, 181, 253],
			snow: [241, 245, 249],
			ink: [205, 216, 230],
			faint: [158, 173, 193],
			surface: [128, 145, 168],
			chip: [45, 60, 84],
			select: [56, 75, 104],
			panel: [14, 20, 32],
		},
	},
	{
		id: 'doom',
		label: 'Doom',
		about: 'янтарь и кровь',
		colors: {
			accent: [255, 138, 76],
			sky: [255, 176, 96],
			mint: [154, 230, 140],
			amber: [255, 200, 80],
			rose: [255, 94, 94],
			violet: [255, 154, 120],
			snow: [255, 236, 222],
			ink: [238, 206, 186],
			faint: [201, 162, 138],
			surface: [170, 130, 108],
			chip: [74, 36, 26],
			select: [102, 48, 32],
			panel: [26, 13, 10],
		},
	},
	{
		id: 'matrix',
		label: 'Матрица',
		about: 'зелёный терминал',
		colors: {
			accent: [110, 231, 150],
			sky: [125, 245, 200],
			mint: [134, 239, 140],
			amber: [220, 240, 120],
			rose: [255, 128, 128],
			violet: [150, 240, 190],
			snow: [226, 255, 236],
			ink: [180, 235, 198],
			faint: [138, 195, 158],
			surface: [110, 162, 128],
			chip: [24, 62, 42],
			select: [32, 82, 55],
			panel: [8, 22, 15],
		},
	},
	{
		id: 'synthwave',
		label: 'Синтвейв',
		about: 'розовый и фиолетовый',
		colors: {
			accent: [255, 138, 216],
			sky: [125, 211, 252],
			mint: [110, 240, 200],
			amber: [253, 224, 120],
			rose: [255, 118, 150],
			violet: [196, 160, 255],
			snow: [250, 240, 255],
			ink: [225, 208, 245],
			faint: [186, 165, 214],
			surface: [154, 133, 184],
			chip: [64, 40, 92],
			select: [86, 52, 122],
			panel: [24, 14, 36],
		},
	},
	{
		id: 'nord',
		label: 'Нордик',
		about: 'спокойный лёд',
		colors: {
			accent: [136, 192, 208],
			sky: [129, 161, 193],
			mint: [163, 214, 148],
			amber: [235, 203, 139],
			rose: [214, 130, 138],
			violet: [180, 156, 205],
			snow: [236, 244, 250],
			ink: [209, 222, 234],
			faint: [166, 181, 197],
			surface: [134, 151, 170],
			chip: [52, 66, 84],
			select: [67, 84, 106],
			panel: [20, 26, 35],
		},
	},
	{
		id: 'mono',
		label: 'Моно',
		about: 'без цвета, максимум контраста',
		colors: {
			accent: [255, 255, 255],
			sky: [226, 226, 226],
			mint: [214, 214, 214],
			amber: [236, 236, 236],
			rose: [255, 255, 255],
			violet: [214, 214, 214],
			snow: [255, 255, 255],
			ink: [226, 226, 226],
			faint: [186, 186, 186],
			surface: [152, 152, 152],
			chip: [62, 62, 62],
			select: [86, 86, 86],
			panel: [16, 16, 16],
		},
	},
]

export const THEME_IDS = THEMES.map(theme => theme.id)

export const findTheme = id => THEMES.find(theme => theme.id === id) ?? THEMES[0]

/** Уровни контраста: подтягивают тусклые токены к белому. */
export const CONTRAST = [
	{ id: 'normal', label: 'обычный', lift: 0 },
	{ id: 'high', label: 'высокий', lift: 0.2 },
	{ id: 'max', label: 'максимальный', lift: 0.4 },
]

/** Стили полосы прогресса. */
export const BARS = [
	{ id: 'blocks', label: 'блоки', full: '█', parts: ['░', '▒', '▓'], empty: '░' },
	{ id: 'bars', label: 'полосы', full: '━', parts: ['╌', '╌', '━'], empty: '━' },
	{ id: 'dots', label: 'точки', full: '●', parts: ['·', '·', '◐'], empty: '·' },
	{ id: 'square', label: 'квадраты', full: '■', parts: ['□', '□', '▨'], empty: '□' },
]

const pick = (list, id) => list.find(entry => entry.id === id) ?? list[0]

export const contrastOf = id => pick(CONTRAST, id)
export const barOf = id => pick(BARS, id)

/** Смешать цвет с белым: 0 — как есть, 1 — чистый белый. */
const lighten = ([r, g, b], amount) => [
	Math.round(r + (255 - r) * amount),
	Math.round(g + (255 - g) * amount),
	Math.round(b + (255 - b) * amount),
]

/**
 * Итоговые цвета под выбранные тему и контраст.
 * Подтягиваются только текстовые токены: фоны обязаны оставаться тёмными,
 * иначе текст на плашках сольётся с самой плашкой.
 */
export function resolveColors({ theme, contrast } = {}) {
	const base = findTheme(theme).colors
	const lift = contrastOf(contrast).lift
	if (lift === 0) return { ...base }

	const out = { ...base }
	for (const token of ['ink', 'faint', 'surface']) out[token] = lighten(base[token], lift)
	return out
}
