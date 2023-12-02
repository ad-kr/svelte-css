import { clone, generate, parse } from "css-tree";
import { filterDynamicAst, filterStaticAst } from "./filterAst";
import { collectUniqueComponentIds } from "./collectUniqueComponentIds";
import {
	insertDynamicAttributes,
	insertStaticAttributes,
} from "./insertAttributes";
import { convertCodeToLiteralExpression } from "./convertCodeToLiteralExpression";
import { replaceCodeParts } from "./replaceCodeParts";

export async function processCss(css: string, filename: string) {
	const processedCss = replaceCodeParts(css);

	const staticAst = parse(processedCss);
	const dynamicAst = clone(staticAst);

	const uniqueComponentIds = await collectUniqueComponentIds(
		staticAst,
		filename
	);

	filterStaticAst(staticAst);
	filterDynamicAst(dynamicAst);

	insertStaticAttributes(staticAst, uniqueComponentIds);
	insertDynamicAttributes(dynamicAst, uniqueComponentIds);

	const staticCss = generate(staticAst);
	let dynamicCss = generate(dynamicAst);

	dynamicCss = convertCodeToLiteralExpression(dynamicCss);

	const staticStyleTag =
		staticCss.length > 0 ? `<style>${staticCss}</style>` : "";
	const dynamicStyleTag =
		dynamicCss.length > 0
			? `<svelte:element this="style">{\`${dynamicCss}\`}</svelte:element>`
			: "";

	return { staticStyleTag, dynamicStyleTag, uniqueComponentIds };
}
