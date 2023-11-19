"use client";

const apiRoot = "https://www.speedrun.com/api/v1";
export async function FetchJSON(endpoint: string) {
	return await FetchRawJSON(`${apiRoot}/${endpoint}`);
}

export async function FetchRawJSON(url: string) {
	const res = await fetch(url, { next: { revalidate: 0 } });
	const json = await res.json();
	return json;
}
