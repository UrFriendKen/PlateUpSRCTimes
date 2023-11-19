import React from "react";

interface TableProps {
	header: string[];
	children?: React.ReactNode;
}

const Table = ({ header, children }: TableProps) => {
	return (
		<table className="table table-zebra table-pin-rows">
			<thead>
				<tr>
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
