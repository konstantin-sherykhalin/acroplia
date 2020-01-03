import React,{useState,useEffect,useRef} from 'react';

import {homepage} from '../package.json';

import {Expression,Variable} from './parsing/expression';
import {find_parentheses,set_expressions,list_variables} from './parsing/functions';


export default () => {
	const inp = useRef(null);
	const cvs = useRef(null);
	const [error,set_error]		= useState('');			// Ошибки
	const [input,set_input]		= useState('');			// Ввод
	const [expression,set_expression] = useState(null);	// Полученное выражение
	const [vars,set_vars]		= useState([]);			// Переменные
	const [view,set_view]		= useState('');			// Представление выражения
	const [result,set_result]	= useState('');			// Результат вычислений

	// Обработка формы ввода
	const handle_key_press = (e) => {
		if(e.key == 'Enter') calc();
	}
	const handle_input = (e) => {
		set_input(e.target.value);
	}
	const show_example = () => {
		set_input('(5/2*x^3+100)/(x^2-10)');
		inp.current.focus();
	}

	// Работа со списком переменных
	const add_variable = (v) => {
		if(!vars.find(e => e.name==v.name)) set_vars([...vars,v]);
	}
	const change_variable = (v) => {
		set_vars(vars.map(e => e.name==v.name ? v : e));
	}

	// Вычисление результата
	const calc = () => {
		set_vars([]);

		// Сперва разбиваем введенное выражение по скобкам
		let divided = find_parentheses(input.replace(/\s/g,''));
		if(!(divided instanceof Array)) {
			set_error('Ошибка в формуле');
		} else {
			set_error('');

			// Далее все полученные последовательности операций преобразуем в единичные выражения
			let expressed = set_expressions(divided,add_variable);
			if(!expressed) {
				set_error('Ошибка в формуле');
			} else {
				set_error('');

				// Для главного выражения убираем скобки и представляем его
				expressed.parentheses = false;
				set_view(expressed.show());

				// Перечисляем найденные переменные и записываем выражение
				set_vars(list_variables(expressed));
				set_expression(expressed);
			}
		}
	}
	const draw = () => {
		// Обозначаем и очищаем холст
		const ctx = cvs.current.getContext('2d');
		const size_x = 1000;
		const size_y = 750;
		cvs.current.height = size_y;
		cvs.current.width  = size_x;
		ctx.clearRect(0,0,size_x,size_y);

		// Создаем поле значений
		const field = [];
		for(let x=+vars[0].domain[0]; x<=+vars[0].domain[1]; x+=+vars[0].accuracy) {
			let y = expression.calc({x});
			field.push({x,y});
		}

		// Устанавливаем границы области
		let min_x = vars[0].domain[0],
			max_x = vars[0].domain[1],
			min_y = 0,
			max_y = 0;

		/*
		 * Обработка уходов в бесконечность - некоторые отдельные значения у могут оказаться слишком большими
		 * Чтобы понять, какие значения можно отбросить, создадим отдельный список и отсортируем их
		 * Отбросим 5% значений снизу и сверху
		 * Посчитаем среднее значение, дисперсию и ширину разброса
		**/
		let y_field = field.map(e => e.y).sort((a,b) => a-b);
		let y_centered = {};
		y_centered.field		= y_field.slice(y_field.length*0.05,y_field.length*0.95);
		y_centered.average		= y_centered.field.reduce((s,c) => s+c,0)/y_centered.field.length;
		y_centered.dispersion	= y_centered.field.reduce((s,c) => s+Math.pow(c-y_centered.average,2))/y_centered.field.length;
		y_centered.width		= Math.abs(y_centered.field[y_centered.field.length-1]-y_centered.field[0]);

		// Теперь, чтобы определить границы по вертикали, используем полученные значения
		let width = Math.min(Math.max(10*y_centered.dispersion,Math.abs(max_x-min_x)),y_centered.width);
		min_y = y_centered.average - width;
		max_y = y_centered.average + width;

		// Функции масштабирования с реальных значений на позиции внутри холста
		const scale_x = (x) => ((x-min_x)/(max_x-min_x)*0.95+0.025)*size_x;
		const scale_y = (y) => (1-(y-min_y)/(max_y-min_y)*0.95-0.025)*size_y;

		// Начинаем рисовать
		ctx.beginPath();
		ctx.moveTo(scale_x(field[0].x),scale_y(field[0].y));
		for(let i=1; i<field.length-1; i++) {
			let x = field[i].x,
				y = field[i].y;

			// Ушли в +бесконечность
			if(y>max_y) {
				ctx.lineTo(scale_x(field[i-1].x),scale_y(max_y));
				ctx.stroke();
				ctx.beginPath();

			// Ушли в -бесконечность
			} else if(y<min_y) {
				ctx.lineTo(scale_x(field[i-1].x),scale_y(min_y));
				ctx.stroke();
				ctx.beginPath();

			// Нормальная точка
			} else {
				// Выходим из бесконечности
				if(field[i-1].y<min_y || field[i-1].y>max_y) {
					if(field[i+1].y-y > 0) {
						ctx.moveTo(scale_x(x),scale_y(min_y));
					} else {
						ctx.moveTo(scale_x(x),scale_y(max_y));
					}
				}
				// Рисуем линию
				ctx.lineTo(scale_x(x),scale_y(y));
			}
			// console.log(field[i].x,field[i].y);
		}
		ctx.stroke();
		ctx.closePath();

		// Ось х
		ctx.beginPath();
		ctx.moveTo(scale_x(0),scale_y(max_y));
		ctx.lineTo(scale_x(0),scale_y(min_y));
		ctx.stroke();
		ctx.closePath();

		// Ось у
		ctx.beginPath();
		ctx.moveTo(scale_x(min_x),scale_y(0));
		ctx.lineTo(scale_x(max_x),scale_y(0));
		ctx.stroke();
		ctx.closePath();

		// Подписи к осям
		ctx.font = '20px Roboto';
		ctx.textBaseLine = 'top';
		ctx.textAlign = 'left';
		ctx.fillText("y",scale_x(0)+10,scale_y(max_y)+20);
		ctx.textAlign = 'right';
		ctx.fillText(vars[0].name,scale_x(max_x)-10,scale_y(0)+20);
		ctx.fillText("0",scale_x(0)-10,scale_y(0)+20);
		ctx.fillText(Math.round(max_y),scale_x(0)-10,scale_y(max_y)+20);
		ctx.textBaseLine = 'bottom';
		ctx.fillText(Math.round(max_x),scale_x(max_x)-10,scale_y(0)-10);
	}

	// Когда меняется выражение
	useEffect(_ => {
		// Переменных нет, можно посчитать
		if(vars.length == 0 && expression) set_result(expression.calc());

		// Одна переменная, можно нарисовать
		if(vars.length == 1) draw();
	},[expression,vars]);

	return (
		<div id="container">
			<h1 id="title">Акроплия</h1>
			<div id="input_area">
				<div className="inline">
					<input ref={inp} value={input} placeholder="Введите формулу" onChange={handle_input} onKeyPress={handle_key_press} />
					<button onClick={calc}>=</button>
				</div>
				<p>Например, <span onClick={show_example}>(5/2*x^3+100)/(x^2-10)</span></p>
			</div>
			{(view || error) ? (
			<div id="result_area">
				{error ? (
					<div className="error">{error}</div>
				) : view ? (
					<>
					<p>Ввод:</p>
					<div className="show inline">
						{vars.length ? ((vars[0].name == 'y' ? 'z' : 'y')+' = ') : null}
						{view}
					</div>
					{result && (
						<>
						<p>Результат:</p>
						<div className="show inline">
							{result}
						</div>
						</>
					)}
					{vars.length ? (
						<>
						<div id="vars">
							{vars.map(e => show_var(e,change_variable))}
						</div>
						{vars.length==1 ? (
							<canvas ref={cvs} id="plot" />
						) : null}
						</>
					) : null}
					</>
				) : null}
			</div>
		) : null}
		</div>
	);
};

const show_var = (e,change) => {

	const change_from = (from) => {
		if(from < e.domain[1]) {
			e.domain[0] = from;
			change(e);
		}
	}
	const change_to = (to) => {
		if(to > e.domain[0]) {
			e.domain[1] = to;
			change(e);
		}
	}
	const change_accuracy = (accuracy) => {
		if(+accuracy) {
			e.accuracy = accuracy;
			change(e);
		}
	}
	const handle_key_press = (e) => {
		if(e.key == 'Enter') document.activeElement.blur();
	}

	return (
		<div key={e.name} className="variable_row inline">
			{e.name} &isin;
			[
				<input type="number" value={e.domain[0]} onChange={e => change_from(e.target.value)} onKeyPress={handle_key_press} />;
				<input type="number" value={e.domain[1]} onChange={e => change_to(e.target.value)} onKeyPress={handle_key_press} />
			];
			&Delta;{e.name} =
			<input type="number" min="0" step="0.1" value={e.accuracy} onChange={e => change_accuracy(e.target.value)} onKeyPress={handle_key_press} />
		</div>
	);
}
