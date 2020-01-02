import React,{useState,useEffect} from 'react';

import {homepage} from '../package.json';


export default () => {
	const [input,set_input] = useState('');
	const [result,set_result] = useState('');

	const handle_key_press = (e) => {
		if(e.key == 'Enter') set_result(input);
	}
	const handle_input = (e) => {
		set_input(e.target.value);
	}

	return (
		<div id="container">
			<div id="input_area" className="inline">
				<input value={input} placeholder="Введите формулу" onChange={handle_input} onKeyPress={handle_key_press} />
				<button onClick={_ => set_result(input)}>></button>
			</div>
			{result && (
			<div id="result_area">
				{result}
			</div>
			)}
		</div>
	);
};


let input = '5+(6*2+3)*(6*(2+3))';
console.log("input:",input);
let res = find_parentheses(input);
console.log(res);

function find_parentheses(input,pos = 0) {
	let res = [];
	for(let i=pos; i<input.length; i++) {
		if(input[i] == '(') {
			let inside = find_parentheses(input,i+1);
			res.push(inside.res);
			i = inside.pos;
		} else if(input[i] == ')') {
			return {res,pos:i};
		} else {
			res.push(input[i]);
		}
	}
	return res;
}

class Expression {
	constructor({left,right,operation}) {
		this.left  = left;
		this.right = right;
		this.operation = operation;
	}

	calc() {
		if(this.left  instanceof Expression) this.left  = this.left.calc();
		if(this.right instanceof Expression) this.right = this.right.calc();

		switch(this.operation) {
			case '+': return this.left+this.right;
			case '-': return this.left-this.right;
			case '*': return this.left*this.right;
			case '/': return this.left/this.right;
			case '^': return Math.pow(this.left,this.right);
		}
	}
}
