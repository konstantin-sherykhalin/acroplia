import React,{useState,useEffect} from 'react';

import {homepage} from '../package.json';

import {find_parentheses,set_expressions} from './parsing/functions';


export default () => {
	const [input,set_input] = useState('55.05+(6/2+3)*(6^(2+3))');
	const [result,set_result] = useState('');

	const handle_key_press = (e) => {
		if(e.key == 'Enter') calc();
	}
	const handle_input = (e) => {
		set_input(e.target.value);
	}

	const calc = () => {
		console.log("input:",input);
		let divided = find_parentheses(input);
		console.log(divided);
		let expressed = set_expressions(divided);
		expressed.parentheses = false;
		console.log(expressed);
		console.log("result:",expressed.calc());
		set_result(expressed.show());
	}

	return (
		<div id="container">
			<h1 id="title">Акроплия</h1>
			<div id="input_area" className="inline">
				<input value={input} placeholder="Введите формулу" onChange={handle_input} onKeyPress={handle_key_press} />
				<button onClick={calc}>></button>
			</div>
			{result && (
			<div id="result_area">
				<div id="result_show">{result}</div>
			</div>
			)}
		</div>
	);
};
