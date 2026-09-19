import { todo } from '../../../shared/kit'
import type { TreeNode } from './_pack'

// #region REC-09 | Дерево в плоский список | ★★☆
/**
 * Обратная операция: все узлы в порядке обхода в глубину, сверху вниз.
 * Поле children в результат не тащим.
 */
export const flattenTree = (nodes: TreeNode[]): Array<{ id: number; title: string }> => todo()
// #endregion
