import React, { Suspense } from "react";

interface TimeProp {
	title: string;
}

const Time = ({ title }: TimeProp) => {
	const dateStr = new Date().toLocaleDateString();
	const timeStr = new Date().toLocaleTimeString();
	return (
		<Suspense>
			<p>
				{title}
				{`${dateStr} ${timeStr}`}
			</p>
		</Suspense>
	);
};

export default Time;
