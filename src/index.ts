import express from "express";
import path from "path";
import sharp from "sharp";
import { Map, Maps } from "./maps";
import { StrongpointImages } from "./strongpoints";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
	const map = req.query.map?.toString() as Map;
	const strongpoints = req.query.strongpoints?.toString().split(",");

	const width = req.query.width?.toString();
	const height = req.query.height?.toString();

	if (width && Number.isNaN(Number.parseInt(width, 10)))
		return res.status(400).json({ error: "width must be an integer" });
	if (height && Number.isNaN(Number.parseInt(height, 10)))
		return res.status(400).json({ error: "height must be an integer" });

	if (!map || !Maps.options.includes(map))
		return res.status(400).json({
			error: `Invalid map. Should be one of: ${Maps.options.join(", ")}`,
		});

	try {
		strongpoints?.forEach((strongpoint) => {
			if (!Object.keys(StrongpointImages[map]).includes(strongpoint))
				throw new Error(
					`${strongpoint} is not a valid strongpoint. Should be one of: ${Object.keys(
						StrongpointImages[map]
					).join(", ")}`
				);
		});
	} catch (error) {
		console.log(error);
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

	return sharp(path.join(process.cwd(), `public/hll_maps/${map}.png`))
		.composite([
			...(strongpoints || []).map((point) => ({
				input: getImgPath(point),
				left: StrongpointImages[map][point].left,
				top: StrongpointImages[map][point].top,
			})),
		])
		.toBuffer()
		.then((data) =>
			sharp(data)
				.resize(
					Number.parseInt(width as string, 10) || 1920,
					Number.parseInt(height as string, 10) || 1920
				)
				.webp()
				.pipe(res)
		);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});