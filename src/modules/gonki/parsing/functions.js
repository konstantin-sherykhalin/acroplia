import {Expression,Variable} from './expression';

// Разбор строки на выражения в скобках
export function find_parentheses(input,pos = 0) {
	let res = [];
	if('+-*/^'.indexOf(input[input.length-1])>=0) return NaN;
	for(let i=pos; i<input.length; i++) {
		// Открыли скобку, все внутри записываем во вложенную структуру
		if(input[i] == '(') {
			if(input[i-1] == ')') res.push('*');
			let inside = find_parentheses(input,i+1);
			if(inside.res instanceof Array) {
				res.push(inside.res);
				i = inside.pos;
			} else {
				return NaN;
			}

		// Закрыли скобку, вернулись на уровень выше
		} else if(input[i] == ')') {
			if('+-*/^'.indexOf(input[i-1])>=0) return NaN;
			return {res,pos:i};

		// Число, может стоять после скобок, знаков операций, переменных, в начале строки
		} else if('0123456789.'.indexOf(input[i])>=0 && ('()+-*/^'.indexOf(input[i-1])>=0 || i==0 || 'abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i-1])>=0)) {

			// Если после скобки, то добавляем пропущенное умножение
			if(input[i-1] == ')') res.push('*');

			// Если после переменной, то вставляем степень
			if('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i-1])>=0) res.push('^');

			// Если дальше идут тоже цифры, то записываем число целиком
			let token = input[i];
			let found_dot = (token=='.');
			while('0123456789'.indexOf(input[i+1])>=0 || input[i+1]=='.' && !found_dot) {
				i++;
				token += input[i];
				if(input[i] == '.') found_dot = true;
			}
			res.push(+token);

		// Знаки операций
		} else if('+-*/^'.indexOf(input[i])>=0) {
			res.push(input[i]);

		// Переменные
		} else if('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i])>=0) {

			// Если после скобки или числа, то добавляем пропущенное умножение
			if(')0123456789.'.indexOf(input[i-1])>=0) res.push('*');

			// Если дальше идут тоже буквы, то считаем их как общее имя переменной
			let token = input[i];
			while('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i+1])>=0) {
				i++;
				token += input[i];
			}
			res.push(token);

		// Больше ничего быть не должно
		} else {
			return NaN;
		}
	}
	return res;
}

// Превращение списка операндов и операций в дерево выражений
export function set_expressions(input) {
	if(input instanceof Array) {
		let iterations = 0;

		// Если только один операнд
		if(input.length == 1) {
			let right;
			if(input[0]  instanceof Array)			right = set_expressions(input[0]);
			else if(typeof input[0] == 'string')	right = new Variable({name:input[0]});
			else									right = input[0];
			input[0] = new Expression({left:'',right,operation:''});

		// Иначе постепенно сокращаем набор операций до дерева выражений
		} else while(input.length>1 && iterations<1000) {
			iterations++;

			// Минус в начале
			if(input[0] == '-') {
				input.unshift(0);
			}

			// Сперва ищем степень
			let pos = -1;
			let pow_pos = input.indexOf('^');

			if(pow_pos>=0) {
				pos = pow_pos;
			} else {

				// Если степени нет, ищем умножение и деление
				let mult_pos = input.indexOf('*'),
					div_pos  = input.indexOf('/');

				if(mult_pos>=0 && div_pos>=0) {
					pos = Math.min(mult_pos,div_pos);
				} else if(mult_pos<0 && div_pos>=0) {
					pos = div_pos;
				} else if(mult_pos>=0 && div_pos<0) {
					pos = mult_pos;
				} else {

					// В конце ищем сложение и вычитание
					let sum_pos = input.indexOf('+'),
						sub_pos = input.indexOf('-');

					if(sum_pos>=0 && sub_pos>=0) {
						pos = Math.min(sum_pos,sub_pos);
					} else if(sum_pos<0 && sub_pos>=0) {
						pos = sub_pos;
					} else if(sum_pos>=0 && sub_pos<0) {
						pos = sum_pos;
					}
				}
			}

			// Итак, мы нашли операцию
			if(pos>=0) {
				let left  = input[pos-1],
					right = input[pos+1];

				// Если слева или справа списки, то преобразовываем их в выражения
				if(left  instanceof Array)		left  = set_expressions(left);
				if(right instanceof Array)		right = set_expressions(right);

				// Если слева или справа переменные, обозначаем их так
				if(typeof left  == 'string')	left  = new Variable({name:left});
				if(typeof right == 'string')	right = new Variable({name:right});

				// И схлопываем 3 значения (левый операнд, операция, правый операнд) в одно выражение
				input.splice(pos-1,3,new Expression({left,right,operation:input[pos]}));
			}
		}
		// Если что-то очень сложное, то такое выбрасываем
		if(iterations == 1000) {
			return NaN;
		}
		input[0].parentheses = true;
		return input[0];
	} else {
		return input;
	}
}

// Перечисление переменных
export function list_variables(expression,list = []) {
	// Если слева или справа переменная, заносим ее в список, если такая там уже есть, то заменяем
	if(expression.left instanceof Variable) {
		let i = list.findIndex(e => e.name==expression.left.name);
		if(i>=0) {
			expression.left = list[i];
		} else {
			list.push(expression.left);
		}
	} else if(expression.left instanceof Expression) {
		list_variables(expression.left,list);
	}

	if(expression.right instanceof Variable) {
		let i = list.findIndex(e => e.name==expression.right.name);
		if(i>=0) {
			expression.right = list[i];
		} else {
			list.push(expression.right);
		}
	} else if(expression.right instanceof Expression) {
		list_variables(expression.right,list);
	}

	// Заодно отсортировываем список переменных
	return list.sort((a,b) => {
		if(a.name<b.name) return -1;
		if(a.name>b.name) return  1;
	});
}
