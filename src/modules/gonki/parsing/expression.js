import React from 'react';

// Выражение
export class Expression {
	constructor({left,right,operation,parentheses = false}) {
		this.left  = left;				// Левая часть
		this.operation = operation;		// Операция
		this.right = right;				// Правая часть
		this.parentheses = parentheses;	// Скобки
	}

	// Вычисление значения
	calc(variables_values = {}) {
		let left,right;

		// Если это выражение, то вычисляем его, если переменная, то подставляем значение
		if(this.left  		instanceof Expression)	left	= this.left.calc(variables_values);
		else if(this.left	instanceof Variable)	left	= this.left.calc(variables_values);
		else										left	= this.left;

		if(this.right		instanceof Expression)	right	= this.right.calc(variables_values);
		else if(this.right	instanceof Variable)	right	= this.right.calc(variables_values);
		else										right	= this.right;

		// Выполняем операцию
		if(this.operation == '+') return left+right;
		if(this.operation == '-') return left-right;
		if(this.operation == '*') return left*right;
		if(this.operation == '/') return left/right;
		if(this.operation == '^') return Math.pow(left,right);

		// Под отсутствием операции может подразумеваться умножение, либо выражение с одним операндом
		if(this.operation == '') {
			if(typeof(left) == 'number' && typeof(right) == 'number') return left*right;
			else if(typeof(left) == 'number')	return left;
			else if(typeof(right) == 'number')	return right;
			else return 0;
		}
	}

	// Отображение выражения
	show() {
		let left,right;
		let operation = this.operation;

		// Не показываем скобки в показателе степени, но показываем, если основание является выражением
		if(operation == '^') {
			if(this.left	instanceof Expression) this.left.parentheses  = true;
			if(this.right	instanceof Expression) this.right.parentheses = false;
		}
		// Не показываем скобки в дроби
		if(operation == '/') {
			this.parentheses = false;
			if(this.left  	instanceof Expression) this.left.parentheses  = false;
			if(this.right	instanceof Expression) this.right.parentheses = false;
		}

		if(this.left  		instanceof Expression)	left	= this.left.show();
		else if(this.left	instanceof Variable)	left	= this.left.show();
		else										left	= this.left;

		if(this.right		instanceof Expression)	right	= this.right.show();
		else if(this.right	instanceof Variable)	right	= this.right.show();
		else										right	= this.right;

		// Выражение -2+5 заменяем на 5-2
		if(operation == '+' && left<0 && right>0) {
			operation = '-';
			[left,right] = [right,-left];
		}

		// Выражение 0-5 заменяем на -5
		if(operation == '-' && left==0) {
			left = '';
		}

		if(operation == '*') {
			// Выражение х*5 заменяем на 5х
			if(this.left instanceof Variable || this.right instanceof Variable) {
				operation = '';
				if(this.left instanceof Variable && !(this.right instanceof Variable)) {
					[left,right] = [right,left];
				}
				this.parentheses = false;
			}
			// Выражение (...)*(...) заменяем на (...)(...)
			if(
				this.left  instanceof Expression && this.left.parentheses &&
				this.right instanceof Expression && this.right.parentheses
			) {
				operation = '';
			}
		}

		// Отображаем выражение
		let res;
		if(operation == '+') {
			res = (<div>{left} + {right}</div>);
		} else if(operation == '-') {
			res = (<div>{left} - {right}</div>);
		} else if(operation == '*') {
			res = (<div>{left}&middot;{right}</div>);
		} else if(operation == '') {
			res = (<div>{left}{right}</div>);
		} else if(operation == '/') {
			res = (
				<div className="divide">
					<div>{left}</div>
					<div className="line" />
					<div>{right}</div>
				</div>
			);
		} else if(operation == '^') {
			res = (
				<div className="power">
					<div className="base">{left}</div>
					<div className="exponent">{right}</div>
				</div>
			);
		}
		// Если нужны скобки, то ставим их
		return (this.parentheses ? (<div>({res})</div>) : (<div>{res}</div>));
	}
}

// Переменная
export class Variable {
	constructor({name,domain = [-10,10],accuracy = 0.01}) {
		this.name = name;
		this.domain = domain;
		this.accuracy = accuracy;
	}

	// Подстановка значения переменной
	calc(variables_values) {
		return variables_values[this.name] || 0;
	}

	// Отображение переменной
	show() {
		return (
			<div className="variable">
				{this.name}
			</div>
		);
	}
}
