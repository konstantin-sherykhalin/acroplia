import React from 'react';

export default class Expression {
	constructor({left,right,operation,parentheses = false}) {
		this.left  = left;
		this.operation = operation;
		this.right = right;
		this.parentheses = parentheses;
	}

	calc() {
		let left  = (this.left  instanceof Expression) ? this.left.calc()  : this.left;
		let right = (this.right instanceof Expression) ? this.right.calc() : this.right;

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
		let left  = (this.left  instanceof Expression) ? this.left.show()  : this.left;
		let right = (this.right instanceof Expression) ? this.right.show() : this.right;

		let res;
		if(this.operation == '+') {
			res = (<div>{left} + {right}</div>);
		} else if(this.operation == '-') {
			res = (<div>{left} - {right}</div>);
		} else if(this.operation == '*') {
			res = (<div>{left}&times;{right}</div>);
		} else if(this.operation == '/') {
			res = (
				<div className="divide">
					<div>{left}</div>
					<div class="line" />
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
