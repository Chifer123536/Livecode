/*
Задание 2. Форма регистрации с проверкой пароля "на лету"

Поля:
1. Email — обязательный, содержит @
2. Пароль — обязательный, минимум 6 символов
3. Подтверждение пароля — должен совпадать с паролем

Логика:
- Ошибки показываются СРАЗУ ПРИ ВВОДЕ (onChange)
- Под полем пароля — индикатор силы:
  - Красный: длина < 4
  - Жёлтый: длина 4-5
  - Зелёный: длина >= 6
- Кнопка активна ТОЛЬКО когда все поля валидны

Условия валидности:
- Email содержит @
- Пароль >= 6 символов
- Пароль совпадает с подтверждением

Действия:
- При сабмите: console.log(data) и очистка формы

Что нужно сделать:
- useState для email, password, confirmPassword, errors
- Функция validate, которая возвращает объект с ошибками
- Функция getPasswordStrength, которая возвращает цвет индикатора
- handleSubmit с preventDefault, проверкой ошибок и очисткой
- isFormValid — проверка, все ли поля валидны
- В JSX: 3 инпута, ошибки под ними, индикатор силы под паролем, кнопка

Типизация:
- errors: { email: string; password: string; confirmPassword: string }

Подсказка: вызывай validate() в каждом onChange
*/

console.log('1')

setTimeout(() => {
	console.log('2')
	Promise.resolve().then(() => {
		console.log('3')
		setTimeout(() => console.log('4'), 0)
		queueMicrotask(() => console.log('5'))
	})
	queueMicrotask(() => console.log('6'))
}, 0)

Promise.resolve()
	.then(() => {
		console.log('7')
		setTimeout(() => console.log('8'), 0)
		queueMicrotask(() => console.log('9'))
	})
	.then(() => {
		console.log('10')
		queueMicrotask(() => console.log('11'))
	})

queueMicrotask(() => console.log('12'))

setTimeout(() => {
	console.log('13')
	Promise.resolve().then(() => console.log('14'))
}, 0)

console.log('15')

/*
1
15


*/
