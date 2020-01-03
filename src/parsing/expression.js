import React from 'react';

export class Expression {
	constructor({left,right,operation,parentheses = false}) {
		this.left  = left;
		this.operation = operation;
		this.right = right;
		this.parentheses = parentheses;
	}

	calc(variables_values = {}) {
		let left,right;

		if(this.left  		instanceof Expression)	left	= this.left.calc(variables_values);
		else if(this.left	instanceof Variable)	left	= this.left.calc(variables_values);
		else										left	= this.left;

		if(this.right		instanceof Expression)	right	= this.right.calc(variables_values);
		else if(this.right	instanceof Variable)	right	= this.right.calc(variables_values);
		else										right	= this.right;

		if(this.operation == '+') return left+right;
		if(this.operation == '-') return left-right;
		if(this.operation == '*') return left*right;
		if(this.operation == '/') return left/right;
		if(this.operation == '^') return Math.pow(left,right);
		if(this.operation == '') {
			if(typeof(left) == 'number' && typeof(right) == 'number') return left*right;
			else if(typeof(left) == 'number')	return left;
			else if(typeof(right) == 'number')	return right;
			else return 0;
		}
	}

	show() {
		let left,right;
		let operation = this.operation;

		if(operation == '^' && this.right	instanceof Expression) this.right.parentheses = false;
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

		if(operation == '+' && left<0 && right>0) {
			operation = '-';
			[left,right] = [right,-left];
		}

		if(operation == '-' && left==0) {
			left = '';
		}

		if(operation == '*') {
			if(this.left instanceof Variable || this.right instanceof Variable) {
				operation = '';
				if(this.left instanceof Variable && !(this.right instanceof Variable)) {
					[left,right] = [right,left];
				}
				this.parentheses = false;
			}
			if(
				this.left  instanceof Expression && this.left.parentheses &&
				this.right instanceof Expression && this.right.parentheses
			) {
				operation = '';
			}
		}

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
		return (this.parentheses ? (<div>({res})</div>) : (<div>{res}</div>));
	}
}

export class Variable {
	constructor({name,domain = [-10,10],accuracy = 0.1}) {
		this.name = name;
		this.domain = domain;
		this.accuracy = accuracy;
	}

	calc(variables_values) {
		return variables_values[this.name] || 0;
	}

	show() {
		return (
			<div className="variable">
				{this.name}
			</div>
		);
	}
}
