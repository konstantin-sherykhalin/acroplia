import React,{useState,useEffect,useRef} from 'react';

const APP_ID = 'AUUXT6-RJY83H99LV';

export default ({input}) => {
	const [error,set_error] = useState('');
	const [waiting,set_waiting] = useState(1);

	useEffect(_ => set_waiting(1),[input]);
	return (
		<>
		{error ? (
			<div className="error">{error}</div>
		) : waiting ? (
			<div className="waiting" />
		) : null}
		<img
			src={'http://api.wolframalpha.com/v1/simple?appid='+APP_ID+'&i='+encodeURI(input)}
			onLoad={_=>set_waiting(0)}
			onError={_=>set_error('Не удалось загрузить результат')}
		/>
		</>
	);
}
