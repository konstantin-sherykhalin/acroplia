import React,{useState,useEffect,useRef} from 'react';

import {Expression,Variable} from './parsing/expression';
import {find_parentheses,set_expressions,list_variables} from './parsing/functions';

export default ({input}) => {
	if(!input) return null;

	const [vars,set_vars]		= useState([]);	// Переменные
	const [result,set_result]	= useState('');	// Результат вычислений

	let error = '',
		expression = null,
		view = null;

	// Работа со списком переменных
	const add_variable = (v) => {
		if(!vars.find(e => e.name==v.name)) set_vars([...vars,v]);
	}
	const change_variable = (v) => {
		set_vars(vars.map(e => e.name==v.name ? v : e));
	}

	// Вычисление результата
	if(input.indexOf('=')>=0) {
		error = 'Это калькулятор, а не решатель уравнений';

	} else {
		// Сперва разбиваем введенное выражение по скобкам
		if(input[0]=='(' && input[input.length-1]==')') input = input.substring(1,input.length-1);
		let divided = find_parentheses(input.replace(/\s/g,''));
		if(!(divided instanceof Array)) {
			error = 'Ошибка в формуле';

		} else {
			// Далее все полученные последовательности операций преобразуем в единичные выражения
			expression = set_expressions(divided,add_variable);
			if(!expression) {
				error = 'Ошибка в формуле';

			} else {
				// Для главного выражения убираем скобки и представляем его
				expression.parentheses = false;
				view = expression.show();
			}
		}
	}

	useEffect(_ => {
		// Перечисляем найденные переменные и записываем выражение
		set_vars(list_variables(expression));
	},[input]);

	useEffect(_ => {
		// Переменных нет, можно посчитать
		if(vars.length == 0 && expression) set_result(expression.calc());
		else set_result('');
	},[vars]);

	return (
		error ? (
			<div className="error">{error}</div>
		) : (expression && view) ? (
			<>
			<p>Ввод:</p>
			<div className="show inline">
				{vars.length ? ((vars.find(e => e.name=='y') ? 'z' : 'y')+' = ') : null}
				{view}
			</div>
			{result ? (
				<>
				<p>Результат:</p>
				<div className="show inline">
					{result}
				</div>
				</>
			) : null}
			{vars.length ? (
				<>
				<div id="vars">
					{vars.map(e => (<ShowVar key={e.name} {...{e,change:change_variable}} />))}
				</div>
				{vars.length==1 ? (
					<Plot vars={vars} expression={expression} />
				) : null}
				</>
			) : null}
			</>
		) : null
	);
}

const ShowVar = ({e,change}) => {

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
		<div className="variable_row inline">
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

const Plot = ({vars,expression}) => {
	const cvs = useRef(null);

	const draw = () => {
		if(!cvs.current) return;

		// Обозначаем и очищаем холст
		const ctx = cvs.current.getContext('2d');
		const size_x = 1000;
		const size_y = 750;
		cvs.current.height = size_y;
		cvs.current.width  = size_x;
		ctx.clearRect(0,0,size_x,size_y);

		// Создаем поле значений
		const field = [];
		for(let x=+vars[0].domain[0]; x<+vars[0].domain[1]; x+=+vars[0].accuracy) {
			let y = expression.calc({[vars[0].name]:x});
			field.push({x,y});
		}
		field.push({x:+vars[0].domain[1],y:expression.calc({x:+vars[0].domain[1]})});

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
		let y_field = field.map(e => e.y).filter(y => !isNaN(y)).sort((a,b) => a-b);
		let y_centered = {};
		y_centered.field		= y_field.slice(y_field.length*0.05,y_field.length*0.95);
		y_centered.average		= y_centered.field.reduce((s,c) => s+c,0)/y_centered.field.length;
		y_centered.dispersion	= y_centered.field.reduce((s,c) => s+Math.pow(c-y_centered.average,2))/y_centered.field.length;
		y_centered.width		= Math.abs(y_centered.field[y_centered.field.length-1]-y_centered.field[0]);

		// Теперь, чтобы определить границы по вертикали, используем полученные значения
		let width = Math.min(Math.max(10*y_centered.dispersion,Math.abs(max_x-min_x)),y_centered.width);
		if(!width) width = Math.abs(max_x-min_x)/2;
		min_y = y_centered.average - width;
		max_y = y_centered.average + width;

		// Функции масштабирования с реальных значений на позиции внутри холста
		const scale_x = (x) => ((x-min_x)/(max_x-min_x)*0.95+0.025)*size_x;
		const scale_y = (y) => (1-(y-min_y)/(max_y-min_y)*0.95-0.025)*size_y;

		// Производные
		const ld = (i) => field[i].y-field[i-1].y;
		const rd = (i) => field[i+1].y-field[i].y;

		// Начинаем рисовать
		ctx.beginPath();
		ctx.moveTo(scale_x(field[0].x),scale_y(field[0].y));
		for(let i=1; i<field.length-1; i++) {
			let x = field[i].x,
				y = field[i].y;

			// Неопределенность
			if(isNaN(y)) {
				ctx.stroke();
				ctx.beginPath();

			// Ушли в бесконечность
			} else if(y<min_y || y>max_y) {
				if(ld(i)>0)	ctx.lineTo(scale_x(x),scale_y(max_y));	// в +
				else 		ctx.lineTo(scale_x(x),scale_y(min_y));	// в -
				ctx.stroke();
				ctx.beginPath();

			// Нормальная точка
			} else {
				// Выходим из неопределенности
				if(isNaN(field[i-1].y)) {
					ctx.beginPath();
					ctx.moveTo(scale_x(x),scale_y(y));
				}
				// Выходим из бесконечности
				if(field[i-1].y<min_y || field[i-1].y>max_y) {
					if(field[i+1].y-y > 0) {
						ctx.moveTo(scale_x(x),scale_y(min_y));
					} else {
						ctx.moveTo(scale_x(x),scale_y(max_y));
					}
				}
				// Если возник разрыв, а ухода в бесконечность не заметили, то дорисовываем их
				if(
					field[i-1].y>min_y && field[i-1].y<max_y &&
					i>1 && (
						field[i-1].y>y && ld(i-1)>0 && rd(i)>0 ||
						field[i-1].y<y && ld(i-1)<0 && rd(i)<0
					)
				) {
					// Ушли в +, вышли из -
					if(field[i-1].y>y && ld(i-1)>0 && rd(i)>0) {
						ctx.lineTo(scale_x(x),scale_y(max_y));
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(scale_x(x),scale_y(min_y));

					// Ушли в +, вышли из -
					} else if(field[i-1].y<y && ld(i-1)<0 && rd(i)<0) {
						ctx.lineTo(scale_x(x),scale_y(min_y));
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(scale_x(x),scale_y(max_y));
					}

				// Рисуем линию
				} else {
					ctx.lineTo(scale_x(x),scale_y(y));
				}
			}
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
	useEffect(draw,[cvs]);
	draw();

	return (<canvas ref={cvs} id="plot" />);
}
