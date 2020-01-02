import React from 'react';

export class Expression {
	constructor({left,right,operation,parentheses = false}) {
		this.left  = left;
		this.operation = operation;
		this.right = right;
		this.parentheses = parentheses;
	}

	calc(variables_values = {}) {
		let left;
		let right;

		if(this.left  		instanceof Expression)	left	= this.left.calc();
		else if(this.left	instanceof Variable)	left	= this.left.calc(variables_values);
		else										left	= this.left;

		if(this.right		instanceof Expression)	right	= this.right.calc();
		else if(this.right	instanceof Variable)	right	= this.right.calc(variables_values);
		else										right	= this.right;

		switch(this.operation) {
			case '+': return left+right;
			case '-': return left-right;
			case '*': return left*right;
			case '/': return left/right;
			case '^': return Math.pow(left,right);
		}
	}

	show() {
		if(this.operation == '^') this.right.parentheses = false;
		if(this.operation == '/') {
			this.parentheses = false;
			if(this.left  	instanceof Expression) this.left.parentheses  = false;
			if(this.right	instanceof Expression) this.right.parentheses = false;
		}

		let left;
		let right;

		if(this.left  		instanceof Expression)	left	= this.left.show();
		else if(this.left	instanceof Variable)	left	= this.left.show();
		else										left	= this.left;

		if(this.right		instanceof Expression)	right	= this.right.show();
		else if(this.right	instanceof Variable)	right	= this.right.show();
		else										right	= this.right;

		if(this.operation == '+' && left<0 && right>0) {
			this.operation = '-';
			[left,right] = [right,-left];
		}
		if(this.operation == '*' && (this.left instanceof Variable || this.right instanceof Variable)) {
			this.operation = '';
			if((this.left instanceof Variable) && !(this.right instanceof Variable)) {
				[left,right] = [right,left];
			}
			this.parentheses = false;
		}

		let res;
		if(this.operation == '+') {
			res = (<div>{left} + {right}</div>);
		} else if(this.operation == '-') {
			res = (<div>{left} - {right}</div>);
		} else if(this.operation == '*') {
			res = (<div>{left}&middot;{right}</div>);
		} else if(this.operation == '') {
			res = (<div>{left}{right}</div>);
		} else if(this.operation == '/') {
			res = (
				<div className="divide">
					<div>{left}</div>
					<div className="line" />
					<div>{right}</div>
				</div>
			);
		} else if(this.operation == '^') {
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
