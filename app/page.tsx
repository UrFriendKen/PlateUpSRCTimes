import Link from "next/link";
import Time from "./components/Time";
import SpeedrunCategory from "./components/SpeedrunCategory";
import { FetchJSON } from "./components/FetchData";
import { Suspense } from "react";
import Loading from "./components/Loading";

async function GetPlateUpID() {
	const json = await FetchJSON("games?abbreviation=plateup");
	return json["data"][0]["id"];
}

async function GetPlateUpCategories(gameID: string) {
	const categories = await FetchJSON(`games/${gameID}/categories`);
	const categoryIDs: { [id: string]: string } = {};
	for (var category of categories["data"]) {
		categoryIDs[category["id"]] = category["name"];
	}
	return categoryIDs;
}

export default async function Home() {
	const gameID: string = await GetPlateUpID();
	const categoryIDs: { [id: string]: string } = await GetPlateUpCategories(
		gameID
	);
	return (
		<div className="p-6">
			<p className="text-3xl font-bold">PlateUp! SRC Times</p>
			<Link href="https://www.speedrun.com/plateup" className="text-s">
				speedrun.com
			</Link>
			<br />
			<br />
			<div>
				<Suspense fallback={<Loading />}>
					<Time title="Rendered at: " />
					{Object.keys(categoryIDs).map((key) => (
						<div key={key}>
							<SpeedrunCategory
								gameID={gameID}
								categoryID={key}
								categoryName={categoryIDs[key]}
							/>
						</div>
					))}
				</Suspense>
			</div>
		</div>
	);
}
