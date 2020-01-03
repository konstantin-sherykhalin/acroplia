import {Expression,Variable} from './expression';

export function find_parentheses(input,pos = 0) {
	let res = [];
	for(let i=pos; i<input.length; i++) {
		if(input[i] == '(') {
			if(input[i-1] == ')') res.push('*');
			let inside = find_parentheses(input,i+1);
			res.push(inside.res);
			i = inside.pos;
		} else if(input[i] == ')') {
			return {res,pos:i};
		} else if('0123456789.'.indexOf(input[i])>=0 && ('()+-*/^'.indexOf(input[i-1])>=0 || i==0 || 'abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i-1])>=0)) {
			if(input[i-1] == ')') res.push('*');
			if('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i-1])>=0) res.push('^');
			let token = input[i];
			let found_dot = (token=='.');
			while('0123456789'.indexOf(input[i+1])>=0 || input[i+1]=='.' && !found_dot) {
				i++;
				token += input[i];
				if(input[i] == '.') found_dot = true;
			}
			res.push(+token);
		} else if('+-*/^'.indexOf(input[i])>=0) {
			res.push(input[i]);
		} else if('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i])>=0) {
			if(')0123456789.'.indexOf(input[i-1])>=0) res.push('*');
			let token = input[i];
			while('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i+1])>=0) {
				i++;
				token += input[i];
			}
			res.push(token);
		} else {
			return NaN;
		}
	}
	return res;
}

export function set_expressions(input) {
	if(input instanceof Array) {
		let iterations = 0;
		if(input.length == 1) {
			let right;
			if(input[0]  instanceof Array)	right  = set_expressions(input[0]);
			if(typeof input[0] == 'string')	right = new Variable({name:input[0]});
			input[0] = new Expression({left:'',right,operation:''});

		} else while(input.length>1 && iterations<1000) {
			iterations++;

			if(input[0] == '-') {
				input.unshift(0);
			}

			let pos = -1;
			let pow_pos = input.indexOf('^');

			if(pow_pos>=0) {
				pos = pow_pos;
			} else {
				let mult_pos = input.indexOf('*'),
					div_pos  = input.indexOf('/');

				if(mult_pos>=0 && div_pos>=0) {
					pos = Math.min(mult_pos,div_pos);
				} else if(mult_pos<0 && div_pos>=0) {
					pos = div_pos;
				} else if(mult_pos>=0 && div_pos<0) {
					pos = mult_pos;
				} else {
					let sum_pos = input.indexOf('+'),
						sub_pos = input.indexOf('-');

					if(sum_pos>=0 && sub_pos>=0) {
						pos = Math.min(sum_pos,sub_pos);
					} else if(sum_pos<0 && sub_pos>=0) {
						pos = sub_pos;
					} else if(sum_pos>=0 && sub_pos<0) {
						pos = sum_pos;
					}
				}
			}

			if(pos>=0) {
				let left  = input[pos-1],
					right = input[pos+1];

				if(left  instanceof Array)		left  = set_expressions(left);
				if(right instanceof Array)		right = set_expressions(right);

				if(typeof left  == 'string')	left  = new Variable({name:left});
				if(typeof right == 'string')	right = new Variable({name:right});

				input.splice(pos-1,3,new Expression({left,right,operation:input[pos]}));
			}
		}
		if(iterations == 1000) {
			return NaN;
		}
		input[0].parentheses = true;
		return input[0];
	} else {
		return input;
	}
}

export function list_variables(expression,list = []) {
	if(expression.left instanceof Variable) {
		let i = list.findIndex(e => e.name==expression.left.name);
		if(i>=0) {
			expression.left = list[i];
		} else {
			list.push(expression.left);
		}
	} else if(expression.left instanceof Expression) {
		list_variables(expression.left,list);
	}

	if(expression.right instanceof Variable) {
		let i = list.findIndex(e => e.name==expression.right.name);
		if(i>=0) {
			expression.right = list[i];
		} else {
			list.push(expression.right);
		}
	} else if(expression.right instanceof Expression) {
		list_variables(expression.right,list);
	}

	return list.sort((a,b) => {
		if(a.name<b.name) return -1;
		if(a.name>b.name) return  1;
	});
}
