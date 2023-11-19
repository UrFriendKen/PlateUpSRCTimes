"use client";
import React from "react";
import Table from "./Table";
import { FetchJSON, FetchRawJSON } from "./FetchData";
import { ToReadableTimeString } from "./StringUtils";
import { useState, useEffect } from "react";
import Loading from "./Loading";
import Time from "./Time";

interface SpeedrunCategoryProp {
	gameID: string;
	categoryID: string;
	categoryName: string;
}

class Variable {
	id: string = "";
	name: string = "";
	values: { [id: string]: string } = {};
}

async function GetVariables(categoryID: string) {
	const variablesData = await FetchJSON(`categories/${categoryID}/variables`);

	const variableValuesDict: { [id: string]: Variable } = {};
	for (var variableData of variablesData["data"]) {
		const variableID = variableData["id"];
		if (
			!variableData["is-subcategory"] ||
			variableData["user-defined"] ||
			variableValuesDict.hasOwnProperty(variableID)
		)
			continue;
		const valuesRef = variableData["values"]["values"];
		const variable = new Variable();
		variable.id = variableData["id"];
		variable.name = variableData["name"];
		for (var valueKey in valuesRef) {
			variable.values[valueKey] = valuesRef[valueKey]["label"];
		}
		variableValuesDict[variableID] = variable;
	}

	return variableValuesDict;
}

class Run {
	id: string = "";
	subcats: { [id: string]: string } = {};
	players: string[] = [];
	time: number = 0;
	status: string = "";
}

function SortNumbers(num1: number, num2: number) {
	if (num1 < num2) return -1;
	if (num1 > num2) return 1;
	return 0;
}

function SortStrings(string1: string, string2: string) {
	if (!string1) string1 = "";
	if (!string2) string2 = "";

	if ((string1 == "" && string2 != "") || string1 < string2) return -1;
	if ((string2 == "" && string1 != "") || string1 > string2) return 1;
	return 0;
}

function SortStringsReverse(string1: string, string2: string) {
	return SortStrings(string2, string1);
}

async function GetRuns(
	gameID: string,
	categoryID: string,
	subcatKeys: string[]
) {
	let nextlink;
	let runs: any = [];
	const topRuns: { [id: string]: Run } = {};
	do {
		let json;
		if (nextlink) json = await FetchRawJSON(nextlink);
		else
			json = await FetchJSON(
				`runs?game=${gameID}&category=${categoryID}&orderby=submitted&direction=desc&embed=players&max=200`
			);
		nextlink = null;
		runs = runs.concat(json["data"]);
		for (var link of json["pagination"]["links"]) {
			if (link["rel"] == "next") {
				nextlink = link["uri"];
				break;
			}
		}
	} while (nextlink);
	for (var runData of runs) {
		const status = runData["status"]["status"];
		if (status != "verified" && status != "new") continue;

		const subcats = runData["values"];

		const runKeyValues = subcatKeys.map((subcatKey) =>
			subcatKey in subcats ? subcats[subcatKey] : ""
		);
		var runKey = runKeyValues.join(",");
		const runTime = runData["times"]["primary_t"];
		let timediff = -1;
		if (runKey in topRuns) {
			timediff = runTime - topRuns[runKey].time;
		}
		if (timediff > 0) continue;
		const run = new Run();
		run.id = runData["id"];
		run.time = runTime;
		for (var playerData of runData["players"]["data"]) {
			switch (playerData["rel"]) {
				case "user": {
					run.players.push(playerData["names"]["international"]);
					break;
				}
				case "guest": {
					run.players.push(playerData["name"]);
					break;
				}
			}
		}

		run.subcats = subcats;
		run.status = runData["status"]["status"];
		topRuns[runKey] = run;
	}
	const topRunsArray = Object.values(topRuns);
	return topRunsArray;
}

export default function SpeedrunCategory(prop: SpeedrunCategoryProp) {
	function SortByTime(run1: Run, run2: Run) {
		return SortNumbers(run1.time, run2.time);
	}
	function GetPlayerCountFromDesc(playerCountDesc: string | null) {
		switch (playerCountDesc) {
			case "Solo":
				return 1;
			case "Duo":
				return 2;
			case "Trio":
				return 3;
			case "Quad":
				return 4;
			default:
				return 5;
		}
	}

	function SortByPlayers(run1: Run, run2: Run) {
		let run1Count = null;
		let run2Count = null;
		if (variables["wlekw94l"]) {
			if (run1.subcats["wlekw94l"])
				run1Count =
					variables["wlekw94l"]?.values[run1.subcats["wlekw94l"]];
			if (run2.subcats["wlekw94l"])
				run2Count =
					variables["wlekw94l"]?.values[run2.subcats["wlekw94l"]];
		}
		return SortNumbers(
			GetPlayerCountFromDesc(run1Count),
			GetPlayerCountFromDesc(run2Count)
		);
	}

	function SortByMapSetting(run1: Run, run2: Run) {
		return SortStrings(run1.subcats["6njy11vn"], run2.subcats["6njy11vn"]);
	}

	function SortByPatches(run1: Run, run2: Run) {
		return SortStringsReverse(
			run1.subcats["0nwgp558"],
			run2.subcats["0nwgp558"]
		);
	}

	function SortByDishes(run1: Run, run2: Run) {
		return SortStrings(run1.subcats["wl3d19v8"], run2.subcats["wl3d19v8"]);
	}

	function SortBySeed(run1: Run, run2: Run) {
		return SortStringsReverse(
			run1.subcats["2lg135el"],
			run2.subcats["2lg135el"]
		);
	}

	const [variables, setVariables] = useState<{ [id: string]: Variable }>({});
	const [variablesLoading, setVariablesLoading] = useState(true);

	const [topRuns, setTopRuns] = useState<Run[]>([]);
	const [topRunsLoading, setTopRunsLoading] = useState(true);

	useEffect(() => {
		GetVariables(prop.categoryID).then((data) => {
			setVariables(data);
			setVariablesLoading(false);
		});
	}, [prop.categoryID]);

	const [headers, setHeaders] = useState<string[]>([]);
	const [subcatKeys, setSubcatKeys] = useState<string[]>([]);

	useEffect(() => {
		const tempSubcatKeys = [];
		const tempHeaders = [];
		for (var varKey in variables) {
			const variable = variables[varKey];
			tempSubcatKeys.push(variable.id);
			tempHeaders.push(variable.name);
		}
		tempHeaders.concat(["Players", "Time", "Status"]);
		setSubcatKeys(tempSubcatKeys);
		setHeaders(tempHeaders);
	}, [variables]);

	useEffect(() => {
		GetRuns(prop.gameID, prop.categoryID, subcatKeys).then((data) => {
			data.sort(SortByTime)
				.sort(SortByDishes)
				.sort(SortByPlayers)
				.sort(SortByMapSetting)
				.sort(SortBySeed)
				.sort(SortByPatches);
			setTopRuns(data);
			setTopRunsLoading(false);
		});
	}, [prop.gameID, prop.categoryID, subcatKeys]);

	if (variablesLoading || topRunsLoading) return <Loading />;

	return (
		<>
			<Time title="Rendered at: " />
			<p className="text-xl font-bold flex justify-center">
				{prop.categoryName}
			</p>
			<Table header={headers}>
				{Object.values(topRuns).map((run) => {
					return (
						<tr key={run.id} className="hover">
							{subcatKeys.map((subcatKey) => {
								if (!(subcatKey in run.subcats))
									return (
										<td key={`${run.id}_${subcatKey}`} />
									);
								return (
									<td key={`${run.id}_${subcatKey}`}>
										{
											variables[subcatKey].values[
												run.subcats[subcatKey]
											]
										}
									</td>
								);
							})}
							<td>
								{run.players.map((player) => {
									return (
										<>
											{player}
											<br />
										</>
									);
								})}
							</td>
							<td>{ToReadableTimeString(run.time)}</td>
							<td>{run.status}</td>
						</tr>
					);
				})}
			</Table>
		</>
	);
}
