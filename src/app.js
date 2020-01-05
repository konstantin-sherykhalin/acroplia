import React,{useState,useEffect,useRef} from 'react';

import {homepage} from '../package.json';

import GonkiResult		from './modules/gonki';
import WolframResult	from './modules/wolfram';


export default () => {
	const inp = useRef(null);
	const [input_value,set_input_value]			= useState('');	// Введеный текст
	const [input,set_input]						= useState('');	// Готовое выражение
	const [interpretation,set_interpretation]	= useState(0);	// Способ обработки

	// Обработка формы ввода
	const handle_key_press = (e) => {
		if(e.key == 'Enter') calc();
	}
	const handle_input = (e) => {
		set_input_value(e.target.value);
	}
	const show_example = () => {
		set_input_value('(7/2*x^3-100)/(x^2-10)');
		inp.current.focus();
	}
	const calc = () => {
		set_input(input_value);
	}

	return (
		<div id="container">
			<h1 id="title">Акроплия</h1>
			<div id="input_area">
				<div className="inline">
					<input ref={inp} type="text" value={input_value} placeholder="Введите формулу" onChange={handle_input} onKeyPress={handle_key_press} />
					<button onClick={calc}>=</button>
				</div>
				<p>Например, <span onClick={show_example}>(7/2*x^3-100)/(x^2-10)</span></p>
				{input_value||input ? (
					<div className="inline">
						Обработка с помощью:
						<label htmlFor="gonki_interpretation">
							<input id="gonki_interpretation" type="radio" checked={!interpretation} onChange={_=>set_interpretation(0)} />
							Гонки.МЕ
						</label>
						<label htmlFor="wolfram_interpretation">
							<input id="wolfram_interpretation" type="radio" checked={interpretation} onChange={_=>set_interpretation(1)} />
							Вольфрам|Альфа
						</label>
					</div>
				) : null}
			</div>
			{input ? (
				<div id="result_area">
					<div style={{display:(interpretation == 0 ? 'flex' : 'none')}}>
						<GonkiResult input={input} />
					</div>
					<div style={{display:(interpretation == 1 ? 'flex' : 'none')}}>
						<WolframResult input={input} />
					</div>
				</div>
			) : null}
		</div>
	);
};
