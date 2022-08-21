import { z } from "zod";
import { Maps } from "./maps";

const Colors = z.enum(["blue", "red"]);

const numberTransformer = (value?: string) =>
	value ? Number.parseInt(value, 10) : undefined;
const sizeRefiner: [(value?: number) => boolean, { message: string }] = [
	(value) => (value ? value <= 1920 : true),
	{ message: "Must be smaller than 1920px" },
];
const capsRefiner: [(value?: number) => boolean, { message: string }] = [
	(value) => (value ? value <= 5 && value >= 0 : true),
	{ message: "Must be between 0 and 5" },
];

export const QuerySchema = z
	.object({
		map: Maps,
		strongpoints: z.string().optional(),
		width: z
			.string()
			.optional()
			.transform(numberTransformer)
			.refine(...sizeRefiner),
		height: z
			.string()
			.optional()
			.transform(numberTransformer)
			.refine(...sizeRefiner),
		axisColor: Colors.optional(),
		alliesColor: Colors.optional(),
		axisCaps: z
			.string()
			.optional()
			.transform(numberTransformer)
			.refine(...capsRefiner),
		alliesCaps: z
			.string()
			.optional()
			.transform(numberTransformer)
			.refine(...capsRefiner),
	})
	.refine(
		(data) =>
			(data.alliesCaps !== undefined && data.alliesColor) ||
			(data.alliesCaps === undefined && !data.alliesColor),
		{ message: "Either provide both alliesColor and alliesCap or neither" }
	)
	.refine(
		(data) => (
			(data.axisCaps !== undefined && data.axisColor) ||
				(data.axisCaps === undefined && !data.axisColor),
			{ message: "Either provide both axisColor and axisCap or neither" }
		)
	);
