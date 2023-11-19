import React, { Suspense } from "react";

interface TimeProp {
	title: string;
}

const Time = ({ title }: TimeProp) => {
	const timeStr = new Date().toLocaleTimeString();
	return (
		<Suspense>
			<p>
				{title}
				{timeStr}
			</p>
		</Suspense>
	);
};

export default Time;
