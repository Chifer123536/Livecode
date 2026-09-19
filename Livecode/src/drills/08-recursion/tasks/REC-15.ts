import { todo } from '../../../shared/kit'
import type { TreeNode } from './_pack'

// #region REC-15 | Путь до узла | ★★★
/**
 * Хлебные крошки: цепочка от корня до узла включительно, или null.
 *
 *   pathToNode(tree, 5) → [{ корень }, { раздел }, { узел 5 }]
 *
 * Приём: путь накапливается в аргументе рекурсии, а не в переменной снаружи.
 */
export const pathToNode = (nodes: TreeNode[], id: number): TreeNode[] | null => todo()
// #endregion
