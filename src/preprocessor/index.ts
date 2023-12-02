import { MarkupPreprocessor, Preprocessor } from "svelte/compiler";
import { processCss } from "./processCss";
import { addAttributesToTags } from "./addAttributesToTags";

export const preprocessScript: Preprocessor = async (opts) => {
	const svelteCssId =
		'export let dataSveltesheetIds = "";dataSveltesheetIds;'; // Using the variable right away prevents svelte from warning about unused prop
	const runtimeIdCode =
		'const svelteCssRuntimeId = "RT" + crypto.randomUUID().replaceAll("-", "");';

	const code = opts.content + svelteCssId + runtimeIdCode;

	return { code };
};

export const preprocessMarkup: MarkupPreprocessor = async (opts) => {
	// TODO: Fix this pattern matching template strings after the css block
	const cssBlockPattern = /{\s*css\s*`([\s\S]*)`\s*}/g;
	const innerCss = Array.from(
		opts.content.matchAll(cssBlockPattern)
	)?.[0]?.[1];

	if (innerCss === undefined) return;

	const codeWithoutCssBlock = opts.content.replace(cssBlockPattern, "");

	const { staticStyleTag, dynamicStyleTag, uniqueComponentIds } =
		await processCss(innerCss, opts.filename ?? "");

	const codeWithAttributes = addAttributesToTags(
		codeWithoutCssBlock,
		uniqueComponentIds
	);

	const code = codeWithAttributes + staticStyleTag + dynamicStyleTag;

	return { code };
};
