import {Expression,Variable} from './expression';

export function find_parentheses(input,pos = 0) {
	let res = [];
	for(let i=pos; i<input.length; i++) {
		if(input[i] == '(') {
			let inside = find_parentheses(input,i+1);
			res.push(inside.res);
			i = inside.pos;
		} else if(input[i] == ')') {
			return {res,pos:i};
		} else if(['0','1','2','3','4','5','6','7','8','9','.'].includes(input[i])) {
			let token = input[i];
			let found_dot = (token=='.');
			for(++i; i<input.length; i++) {
				if(['0','1','2','3','4','5','6','7','8','9'].includes(input[i])) {
					token += input[i];
				} else if(input[i] == '.') {
					if(found_dot) {
						return NaN;
					} else {
						token += input[i];
						found_dot = true;
					}
				} else {
					i--;
					break;
				}
			}
			res.push(+token);
		} else if(['+','-','*','/','^'].includes(input[i])) {
			res.push(input[i]);
		} else if('abcdefghijklmnopqrstuvwxyz_'.indexOf(input[i])>=0) {
			let token = input[i];
			for(++i; i<input.length; i++) {
				if('abcdefghijklmnopqrstuvwxyz_0123456789'.indexOf(input[i])>=0) {
					token += input[i];
				} else {
					i--;
					break;
				}
			}
			res.push(token);
		}
	}
	return res;
}

export function set_expressions(input,add_variable) {
	if(input instanceof Array) {
		while(input.length>1) {
			if(input[0] == '-') {
				input.shift();
				input[0] = -input[0];
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

				if(left  instanceof Array) left  = set_expressions(left,add_variable);
				if(right instanceof Array) right = set_expressions(right,add_variable);

				if(typeof left  == 'string') {
					left  = new Variable({name:left});
					add_variable(left);
				}
				if(typeof right == 'string') {
					right = new Variable({name:right});
					add_variable(right);
				}

				input.splice(pos-1,3,new Expression({left,right,operation:input[pos]}));
			}
		}
		input[0].parentheses = true;
		return input[0];
	} else {
		return input;
	}
}
