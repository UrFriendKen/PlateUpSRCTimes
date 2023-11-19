"use client";
import React from "react";

interface TableProps {
	header: string[];
	children?: React.ReactNode;
}

const Table = ({ header, children }: TableProps) => {
	return (
		<table className="table table-pin-rows">
			<thead>
				<tr className="text-lg">
					{header.map((text) => {
						return <th key={text}>{text}</th>;
					})}
				</tr>
			</thead>
			<tbody>{children}</tbody>
		</table>
	);
};

export default Table;
