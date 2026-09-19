import { todo } from '../../../shared/kit'

// #region VAL-14 | Файл | ★★☆
/**
 * Проверка перед отправкой: размер в байтах и расширение из списка (без учёта регистра).
 * Сначала проверяется расширение, потом размер. Тексты ошибок дословно:
 *   `Допустимые форматы: ${extensions.join(', ')}` и `Файл больше ${maxSize} байт`.
 *
 *   validateFile({ name: 'a.PNG', size: 100 }, { maxSize: 1000, extensions: ['png'] }) → null
 */
export type FileLike = { name: string; size: number }
export const validateFile = (
	file: FileLike,
	rules: { maxSize: number; extensions: string[] }
): string | null => todo()
// #endregion
