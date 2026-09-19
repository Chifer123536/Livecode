import { describe, expect, it } from 'vitest'
import {
	binarySearch,
	climbStairs,
	coinChange,
	firstUniqueChar,
	groupAnagrams,
	hasPairWithSum,
	isAnagram,
	isBalanced,
	isPalindromeLoose,
	longestCommonPrefix,
	longestUniqueSubstring,
	lowerBound,
	majorityElement,
	maxProfit,
	maxSubarraySum,
	maxWindowSum,
	mergeIntervals,
	mergeSort,
	mergeSorted,
	moveZeroes,
	productExceptSelf,
	quickSort,
	removeDuplicates,
	rotate,
	topKFrequent,
	twoSum,
	type Interval,
} from './tasks'

// #region ALG-01
describe('ALG-01 twoSum', () => {
	it('находит пару', () => expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]))
	it('пара в середине', () => expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]))
	it('одинаковые числа', () => expect(twoSum([3, 3], 6)).toEqual([0, 1]))
	it('нет пары — null', () => expect(twoSum([1, 2], 100)).toBeNull())
	it('один элемент нельзя использовать дважды', () => expect(twoSum([3, 1], 6)).toBeNull())
	it('отрицательные', () => expect(twoSum([-3, 4, 1], -2)).toEqual([0, 2]))
})
// #endregion

// #region ALG-02
describe('ALG-02 hasPairWithSum', () => {
	it('пара есть', () => expect(hasPairWithSum([1, 3, 5, 9], 8)).toBe(true))
	it('пары нет', () => expect(hasPairWithSum([1, 3, 5, 9], 100)).toBe(false))
	it('края', () => expect(hasPairWithSum([1, 2, 3, 10], 11)).toBe(true))
	it('один элемент', () => expect(hasPairWithSum([5], 10)).toBe(false))
	it('пустой массив', () => expect(hasPairWithSum([], 0)).toBe(false))
})
// #endregion

// #region ALG-03
describe('ALG-03 isAnagram', () => {
	it('анаграмма', () => expect(isAnagram('листок', 'слиток')).toBe(true))
	it('разные длины', () => expect(isAnagram('abc', 'ab')).toBe(false))
	it('те же буквы, другое количество', () => expect(isAnagram('aabb', 'abbb')).toBe(false))
	it('пустые строки', () => expect(isAnagram('', '')).toBe(true))
})
// #endregion

// #region ALG-04
describe('ALG-04 firstUniqueChar', () => {
	it('находит первый уникальный', () => expect(firstUniqueChar('abca')).toBe(1))
	it('уникальных нет', () => expect(firstUniqueChar('aabb')).toBe(-1))
	it('первый символ уникален', () => expect(firstUniqueChar('zabab')).toBe(0))
	it('пустая строка', () => expect(firstUniqueChar('')).toBe(-1))
})
// #endregion

// #region ALG-05
describe('ALG-05 maxSubarraySum', () => {
	it('классический вход', () => expect(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6))
	it('все положительные', () => expect(maxSubarraySum([1, 2, 3])).toBe(6))
	it('все отрицательные — наименее плохой', () => expect(maxSubarraySum([-5, -2, -9])).toBe(-2))
	it('один элемент', () => expect(maxSubarraySum([-7])).toBe(-7))
	it('пустой массив', () => expect(maxSubarraySum([])).toBe(0))
})
// #endregion

// #region ALG-06
describe('ALG-06 maxWindowSum', () => {
	it('находит лучшее окно', () => expect(maxWindowSum([1, 5, 2, 8, 1], 2)).toBe(10))
	it('окно во всю длину', () => expect(maxWindowSum([1, 2, 3], 3)).toBe(6))
	it('окно шире массива', () => expect(maxWindowSum([1, 2], 5)).toBe(0))
	it('k = 0', () => expect(maxWindowSum([1, 2], 0)).toBe(0))
	it('отрицательные', () => expect(maxWindowSum([-3, -1, -2], 2)).toBe(-3))
})
// #endregion

// #region ALG-07
describe('ALG-07 longestUniqueSubstring', () => {
	it('классика', () => expect(longestUniqueSubstring('abcabcbb')).toBe(3))
	it('все одинаковые', () => expect(longestUniqueSubstring('bbbb')).toBe(1))
	it('повтор не подряд', () => expect(longestUniqueSubstring('pwwkew')).toBe(3))
	it('левый край не едет назад', () => expect(longestUniqueSubstring('abba')).toBe(2))
	it('пустая строка', () => expect(longestUniqueSubstring('')).toBe(0))
	it('без повторов вообще', () => expect(longestUniqueSubstring('abcdef')).toBe(6))
})
// #endregion

// #region ALG-08
describe('ALG-08 binarySearch', () => {
	it('находит элемент', () => expect(binarySearch([1, 3, 5, 7], 5)).toBe(2))
	it('первый элемент', () => expect(binarySearch([1, 3, 5, 7], 1)).toBe(0))
	it('последний элемент', () => expect(binarySearch([1, 3, 5, 7], 7)).toBe(3))
	it('нет элемента', () => expect(binarySearch([1, 3, 5, 7], 4)).toBe(-1))
	it('пустой массив', () => expect(binarySearch([], 1)).toBe(-1))
	it('большой массив', () => {
		const big = Array.from({ length: 100_000 }, (_, i) => i * 2)
		expect(binarySearch(big, 99_998)).toBe(49_999)
	})
})
// #endregion

// #region ALG-09
describe('ALG-09 lowerBound', () => {
	it('вставка в середину', () => expect(lowerBound([1, 3, 5, 7], 4)).toBe(2))
	it('больше всех', () => expect(lowerBound([1, 3, 5, 7], 9)).toBe(4))
	it('меньше всех', () => expect(lowerBound([1, 3, 5, 7], 0)).toBe(0))
	it('первое вхождение дубля', () => expect(lowerBound([1, 3, 3, 7], 3)).toBe(1))
	it('пустой массив', () => expect(lowerBound([], 5)).toBe(0))
})
// #endregion

// #region ALG-10
describe('ALG-10 rotate', () => {
	it('сдвиг вправо', () => expect(rotate([1, 2, 3, 4, 5], 2)).toEqual([4, 5, 1, 2, 3]))
	it('k больше длины', () => expect(rotate([1, 2, 3, 4, 5], 7)).toEqual([4, 5, 1, 2, 3]))
	it('k = 0', () => expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]))
	it('отрицательный k — сдвиг влево', () => expect(rotate([1, 2, 3, 4, 5], -1)).toEqual([2, 3, 4, 5, 1]))
	it('пустой массив', () => expect(rotate([], 3)).toEqual([]))
	it('не мутирует вход', () => {
		const source = [1, 2, 3]
		rotate(source, 1)
		expect(source).toEqual([1, 2, 3])
	})
})
// #endregion

// #region ALG-11
describe('ALG-11 moveZeroes', () => {
	it('двигает нули в конец', () => {
		const nums = [0, 1, 0, 3, 12]
		moveZeroes(nums)
		expect(nums).toEqual([1, 3, 12, 0, 0])
	})
	it('меняет массив на месте', () => {
		const nums = [0, 1]
		const same = nums
		moveZeroes(nums)
		expect(same).toEqual([1, 0])
	})
	it('нулей нет', () => {
		const nums = [1, 2, 3]
		moveZeroes(nums)
		expect(nums).toEqual([1, 2, 3])
	})
	it('только нули', () => {
		const nums = [0, 0]
		moveZeroes(nums)
		expect(nums).toEqual([0, 0])
	})
	it('пустой массив', () => {
		const nums: number[] = []
		moveZeroes(nums)
		expect(nums).toEqual([])
	})
})
// #endregion

// #region ALG-12
describe('ALG-12 removeDuplicates', () => {
	it('возвращает новую длину', () => expect(removeDuplicates([1, 1, 2, 3, 3])).toBe(3))
	it('переписывает начало массива', () => {
		const nums = [1, 1, 2, 3, 3]
		const length = removeDuplicates(nums)
		expect(nums.slice(0, length)).toEqual([1, 2, 3])
	})
	it('три одинаковых подряд', () => {
		const nums = [2, 2, 2]
		expect(removeDuplicates(nums)).toBe(1)
		expect(nums[0]).toBe(2)
	})
	it('дублей нет', () => expect(removeDuplicates([1, 2, 3])).toBe(3))
	it('пустой массив', () => expect(removeDuplicates([])).toBe(0))
})
// #endregion

// #region ALG-13
describe('ALG-13 mergeSorted', () => {
	it('слияние', () => expect(mergeSorted([1, 4], [2, 3])).toEqual([1, 2, 3, 4]))
	it('разная длина', () => expect(mergeSorted([1], [2, 3, 4])).toEqual([1, 2, 3, 4]))
	it('один пустой', () => expect(mergeSorted([], [1, 2])).toEqual([1, 2]))
	it('оба пустые', () => expect(mergeSorted([], [])).toEqual([]))
	it('дубли сохраняются', () => expect(mergeSorted([1, 1], [1])).toEqual([1, 1, 1]))
})
// #endregion

// #region ALG-14
describe('ALG-14 mergeIntervals', () => {
	it('склеивает пересекающиеся', () => {
		const input: Interval[] = [
			[1, 3],
			[2, 6],
			[8, 10],
		]
		expect(mergeIntervals(input)).toEqual([
			[1, 6],
			[8, 10],
		])
	})
	it('касание считается пересечением', () => {
		expect(
			mergeIntervals([
				[1, 3],
				[3, 5],
			])
		).toEqual([[1, 5]])
	})
	it('вход не отсортирован', () => {
		expect(
			mergeIntervals([
				[8, 10],
				[1, 3],
				[2, 5],
			])
		).toEqual([
			[1, 5],
			[8, 10],
		])
	})
	it('вложенный интервал', () => {
		expect(
			mergeIntervals([
				[1, 10],
				[2, 3],
			])
		).toEqual([[1, 10]])
	})
	it('пустой вход', () => expect(mergeIntervals([])).toEqual([]))
	it('не мутирует вход', () => {
		const input: Interval[] = [
			[2, 6],
			[1, 3],
		]
		mergeIntervals(input)
		expect(input).toEqual([
			[2, 6],
			[1, 3],
		])
	})
})
// #endregion

// #region ALG-15
describe('ALG-15 isBalanced', () => {
	it('вложенные скобки', () => expect(isBalanced('{[()]}')).toBe(true))
	it('перекрёстные не считаются', () => expect(isBalanced('([)]')).toBe(false))
	it('незакрытая скобка', () => expect(isBalanced('(((')).toBe(false))
	it('лишняя закрывающая', () => expect(isBalanced('())')).toBe(false))
	it('пустая строка', () => expect(isBalanced('')).toBe(true))
	it('другие символы игнорируются', () => expect(isBalanced('a(b)c')).toBe(true))
})
// #endregion

// #region ALG-16
describe('ALG-16 isPalindromeLoose', () => {
	it('фраза с пробелами', () => expect(isPalindromeLoose('А роза упала на лапу Азора')).toBe(true))
	it('со знаками препинания', () => expect(isPalindromeLoose('A man, a plan, a canal: Panama')).toBe(true))
	it('не палиндром', () => expect(isPalindromeLoose('привет')).toBe(false))
	it('только мусор', () => expect(isPalindromeLoose('.,!')).toBe(true))
	it('пустая строка', () => expect(isPalindromeLoose('')).toBe(true))
	it('цифры учитываются', () => expect(isPalindromeLoose('12 321')).toBe(true))
})
// #endregion

// #region ALG-17
describe('ALG-17 majorityElement', () => {
	it('находит большинство', () => expect(majorityElement([2, 2, 1, 2, 3])).toBe(2))
	it('большинство в конце', () => expect(majorityElement([1, 3, 3, 3])).toBe(3))
	it('один элемент', () => expect(majorityElement([7])).toBe(7))
	it('все одинаковые', () => expect(majorityElement([5, 5, 5])).toBe(5))
})
// #endregion

// #region ALG-18
describe('ALG-18 productExceptSelf', () => {
	it('обычный случай', () => expect(productExceptSelf([1, 2, 3, 4])).toEqual([24, 12, 8, 6]))
	it('один ноль', () => expect(productExceptSelf([0, 2, 3])).toEqual([6, 0, 0]))
	it('два нуля — всё по нулям', () => expect(productExceptSelf([0, 0, 3])).toEqual([0, 0, 0]))
	it('отрицательные', () => expect(productExceptSelf([-1, 2])).toEqual([2, -1]))
	it('не мутирует вход', () => {
		const source = [1, 2, 3]
		productExceptSelf(source)
		expect(source).toEqual([1, 2, 3])
	})
})
// #endregion

// #region ALG-19
describe('ALG-19 maxProfit', () => {
	it('обычный случай', () => expect(maxProfit([7, 1, 5, 3, 6, 4])).toBe(5))
	it('только падение', () => expect(maxProfit([7, 6, 5])).toBe(0))
	it('один день', () => expect(maxProfit([5])).toBe(0))
	it('пустой массив', () => expect(maxProfit([])).toBe(0))
	it('рост в конце', () => expect(maxProfit([3, 2, 1, 10])).toBe(9))
})
// #endregion

// #region ALG-20
describe('ALG-20 longestCommonPrefix', () => {
	it('общий префикс есть', () => expect(longestCommonPrefix(['flower', 'flow', 'flight'])).toBe('fl'))
	it('префикса нет', () => expect(longestCommonPrefix(['a', 'b'])).toBe(''))
	it('одно слово', () => expect(longestCommonPrefix(['один'])).toBe('один'))
	it('пустой список', () => expect(longestCommonPrefix([])).toBe(''))
	it('одно слово — префикс другого', () => expect(longestCommonPrefix(['ab', 'abc'])).toBe('ab'))
	it('пустая строка в списке', () => expect(longestCommonPrefix(['abc', ''])).toBe(''))
})
// #endregion

// #region ALG-21
describe('ALG-21 quickSort', () => {
	it('сортирует', () => expect(quickSort([5, 2, 9, 1])).toEqual([1, 2, 5, 9]))
	it('дубли', () => expect(quickSort([3, 3, 1, 3])).toEqual([1, 3, 3, 3]))
	it('все одинаковые не вешают рекурсию', () => expect(quickSort([2, 2, 2, 2])).toEqual([2, 2, 2, 2]))
	it('отрицательные', () => expect(quickSort([0, -5, 3])).toEqual([-5, 0, 3]))
	it('пустой массив', () => expect(quickSort([])).toEqual([]))
	it('не мутирует вход', () => {
		const source = [3, 1, 2]
		quickSort(source)
		expect(source).toEqual([3, 1, 2])
	})
	it('уже отсортированный', () => expect(quickSort([1, 2, 3])).toEqual([1, 2, 3]))
})
// #endregion

// #region ALG-22
describe('ALG-22 mergeSort', () => {
	it('сортирует', () => expect(mergeSort([5, 2, 9, 1])).toEqual([1, 2, 5, 9]))
	it('один элемент', () => expect(mergeSort([1])).toEqual([1]))
	it('пустой массив', () => expect(mergeSort([])).toEqual([]))
	it('не мутирует вход', () => {
		const source = [3, 1, 2]
		mergeSort(source)
		expect(source).toEqual([3, 1, 2])
	})
	it('большой массив', () => {
		const big = Array.from({ length: 2000 }, (_, i) => (i * 7919) % 2000)
		expect(mergeSort(big)).toEqual([...big].sort((a, b) => a - b))
	})
})
// #endregion

// #region ALG-23
describe('ALG-23 groupAnagrams', () => {
	it('группирует', () => {
		expect(groupAnagrams(['листок', 'слиток', 'кот'])).toEqual([['листок', 'слиток'], ['кот']])
	})
	it('порядок групп — по первому появлению', () => {
		expect(groupAnagrams(['кот', 'ток', 'дом'])).toEqual([['кот', 'ток'], ['дом']])
	})
	it('все разные', () => expect(groupAnagrams(['a', 'b'])).toEqual([['a'], ['b']]))
	it('пустой список', () => expect(groupAnagrams([])).toEqual([]))
})
// #endregion

// #region ALG-24
describe('ALG-24 topKFrequent', () => {
	it('топ-2', () => expect(topKFrequent([1, 1, 2, 2, 3], 2)).toEqual([1, 2]))
	it('k = 1', () => expect(topKFrequent([4, 4, 1], 1)).toEqual([4]))
	it('k больше числа уникальных', () => expect(topKFrequent([1, 2], 10)).toEqual([1, 2]))
	it('k = 0', () => expect(topKFrequent([1, 2], 0)).toEqual([]))
	it('при равной частоте — порядок появления', () => expect(topKFrequent([5, 9, 5, 9], 2)).toEqual([5, 9]))
})
// #endregion

// #region ALG-25
describe('ALG-25 climbStairs', () => {
	it('пять ступеней', () => expect(climbStairs(5)).toBe(8))
	it('одна ступень', () => expect(climbStairs(1)).toBe(1))
	it('две ступени', () => expect(climbStairs(2)).toBe(2))
	it('десять ступеней', () => expect(climbStairs(10)).toBe(89))
	it('большое n не переполняет стек', () => expect(climbStairs(50)).toBe(20_365_011_074))
})
// #endregion

// #region ALG-26
describe('ALG-26 coinChange', () => {
	it('жадность здесь ошиблась бы', () => expect(coinChange([1, 3, 4], 6)).toBe(2))
	it('собрать нельзя', () => expect(coinChange([2], 3)).toBe(-1))
	it('нулевая сумма', () => expect(coinChange([1, 2, 5], 0)).toBe(0))
	it('обычный размен', () => expect(coinChange([1, 2, 5], 11)).toBe(3))
	it('монет нет', () => expect(coinChange([], 5)).toBe(-1))
	it('номинал равен сумме', () => expect(coinChange([7], 7)).toBe(1))
})
// #endregion
