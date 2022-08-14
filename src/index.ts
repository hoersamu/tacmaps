import express from "express";
import path from "path";
import sharp, { OverlayOptions } from "sharp";
import { Map } from "./maps";
import { QuerySchema } from "./schema";
import { MapDirections, StrongpointImages } from "./strongpoints";

const app = express();
const port = 3000;

const validateStrongpoints = (strongpoints: string[] | undefined, map: Map) =>
	strongpoints?.forEach((strongpoint) => {
		if (!Object.keys(StrongpointImages[map]).includes(strongpoint))
			throw new Error(
				`${strongpoint} is not a valid strongpoint. Should be one of: ${Object.keys(
					StrongpointImages[map]
				).join(", ")}`
			);
	});

const getOverlaySize = (map: Map, caps: number): [number, number] => {
	if (MapDirections[map] === "btt" || MapDirections[map] === "ttb") {
		return [1920, 384 * caps];
	}
	return [384 * caps, 1920];
};

const getOverlayLocatione = (
	map: Map,
	caps: number,
	faction: "axis" | "allies"
): { top: number; left: number } => {
	if (
		(MapDirections[map] === "ttb" && faction === "axis") ||
		(MapDirections[map] === "btt" && faction === "allies") ||
		(MapDirections[map] === "rtl" && faction === "allies") ||
		(MapDirections[map] === "ltr" && faction === "axis")
	) {
		return { top: 0, left: 0 };
	}
	if (MapDirections[map] === "ttb" || MapDirections[map] === "btt") {
		return { top: 1920 - 384 * caps, left: 0 };
	}
	return { top: 0, left: 1920 - 384 * caps };
};

app.get("/tacmap", async (req, res) => {
	const params = QuerySchema.safeParse(req.query);
	if (!params.success) {
		res.status(400).send(params.error);
		return;
	}

	const { map, width, height, axisCaps, axisColor, alliesCaps, alliesColor } =
		params.data;
	const strongpoints = params.data.strongpoints?.split(",") || [];

	try {
		validateStrongpoints(strongpoints, map);
	} catch (error) {
		return res.status(400).json({ error: (error as Error).message });
	}

	const folderPath = path.join(
		process.cwd(),
		`public/strongpoints/${map.toLowerCase()}`
	);
	const getImgPath = (strongpoint: string): string =>
		path.join(folderPath, `${strongpoint}.png`);

	res.statusCode = 200;

	// setting our cache duration
	const cacheMaxAge = 24 * 60 * 60; // 1 day
	res.setHeader("cache-control", `public, max-age=${cacheMaxAge}`);

	// setting our "Content-Type" as an image file
	res.setHeader("Content-Type", "image/webp");

	const colorOverlays: OverlayOptions[] = [];

	if (axisCaps && axisColor) {
		const input = await sharp(
			path.join(process.cwd(), `public/${axisColor}.png`)
		)
			.resize(...getOverlaySize(map, axisCaps))
			.toBuffer();

		colorOverlays.push({
			input,
			...getOverlayLocatione(map, axisCaps, "axis"),
		});
	}
	if (alliesCaps && alliesColor) {
		const input = await sharp(
			path.join(process.cwd(), `public/${alliesColor}.png`)
		)
			.resize(...getOverlaySize(map, alliesCaps))
			.toBuffer();

		colorOverlays.push({
			input,
			...getOverlayLocatione(map, alliesCaps, "allies"),
		});
	}

	return sharp(path.join(process.cwd(), `public/hll_maps/${map}.png`))
		.composite([
			...(strongpoints || []).map((point) => ({
				input: getImgPath(point),
				left: StrongpointImages[map][point].left,
				top: StrongpointImages[map][point].top,
			})),
			...colorOverlays,
		])
		.toBuffer()
		.then((data) =>
			sharp(data)
				.resize(width || 1920, height || 1920)
				.webp()
				.pipe(res)
		);
});

app.get("/", (_req, res) => {
	res.sendFile(path.join(process.cwd(), "src/index.html"));
});

app.get("/maps", (_req, res) => {
	res.send(Object.keys(MapDirections));
});

app.get("/strongpoints", (_req, res) => {
	res.send(
		Object.keys(StrongpointImages).reduce((result, key) => {
			result[key] = Object.keys(StrongpointImages[key as Map]);
			return result;
		}, {} as Record<string, string[]>)
	);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
