import { todo } from '../../../shared/kit'

// #region STR-18 | Экранировать HTML | ★★☆
/**
 * Заменить & < > " ' на HTML-сущности. Порядок важен: амперсанд первым.
 *
 *   escapeHtml('<b>"x"</b>') → '&lt;b&gt;&quot;x&quot;&lt;/b&gt;'
 *
 * Практика: вывод пользовательского текста без риска XSS.
 */
export const escapeHtml = (text: string): string => todo()
// #endregion
