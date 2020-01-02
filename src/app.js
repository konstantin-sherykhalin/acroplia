import React,{useState,useEffect} from 'react';

import {homepage} from '../package.json';

import {find_parentheses,set_expressions} from './parsing/functions';


export default () => {
	const [input,set_input]		= useState('-55.05+(6/2+3)*(6^(-2+3)*x)+x*5');
	const [vars,set_vars]		= useState([]);
	const [view,set_view]		= useState('');
	const [result,set_result]	= useState('');

	const handle_key_press = (e) => {
		if(e.key == 'Enter') calc();
	}
	const handle_input = (e) => {
		set_input(e.target.value);
	}

	const add_variable = (v) => {
		if(!vars.find(e => e.name==v.name)) set_vars([...vars,v]);
	}
	const change_variable = (v) => {
		set_vars(vars.map(e => e.name==v.name ? v : e));
	}
	const calc = () => {
		let divided = find_parentheses(input);
		let expressed = set_expressions(divided,add_variable);
		expressed.parentheses = false;
		set_view(expressed.show());
	}

	return (
		<div id="container">
			<h1 id="title">Акроплия</h1>
			<div id="input_area" className="inline">
				<input value={input} placeholder="Введите формулу" onChange={handle_input} onKeyPress={handle_key_press} />
				<button onClick={calc}>=</button>
			</div>
			{view && (
			<div id="result_area">
				<p>Ввод:</p>
				<div id="show">{view}</div>
				{vars.length && (
					<>
					<div id="vars">
						{vars.map(e => show_var(e,change_variable))}
					</div>
					<canvas id="plot" height="1000" width="1000" />
					</>
				)}
			</div>
			)}
		</div>
	);
};

const show_var = (e,change) => {

	const change_from = (from) => {
		e.domain[0] = from;
		change(e);
	}
	const change_to = (to) => {
		e.domain[1] = to;
		change(e);
	}
	const change_accuracy = (accuracy) => {
		e.accuracy = accuracy;
		change(e);
	}

	return (
		<div key={e.name} className="variable_row inline">
			{e.name} &isin;
			[
				<input value={e.domain[0]} onChange={e => change_from(e.target.value)} />;
				<input value={e.domain[1]} onChange={e => change_to(e.target.value)} />
			]
			&Delta;{e.name} = <input value={e.accuracy} onChange={e => change_accuracy(e.target.value)} />
		</div>
	);
}
