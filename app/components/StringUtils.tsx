export function ToReadableTimeString(totalSeconds: number) {
	let milli = Math.round(totalSeconds * 1000);
	let hours = Math.floor(milli / 3600000).toString();
	let minutes = Math.floor((milli % 3600000) / 60000).toString();
	let seconds = Math.floor((milli % 60000) / 1000).toString();
	let milliseconds = (milli % 1000).toString();
	if (hours != "0") {
		if (milliseconds != "0")
			return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(
				2,
				"0"
			)}.${milliseconds.padStart(3, "0")}`;
		else
			return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(
				2,
				"0"
			)}`;
	} else if (minutes != "0") {
		if (milliseconds != "0")
			return `${minutes}:${seconds.padStart(
				2,
				"0"
			)}.${milliseconds.padStart(3, "0")}`;
		else return `${minutes}:${seconds.padStart(2, "0")}`;
	} else if (seconds != "0") {
		if (milliseconds != "0")
			return `${seconds}.${milliseconds.padStart(3, "0")}`;
		else return `0:${seconds.padStart(2, "0")}`;
	} else return `0.${milliseconds.padStart(3, "0")}`;
}
