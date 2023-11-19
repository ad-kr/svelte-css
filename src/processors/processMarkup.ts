import { MarkupPreprocessor } from "svelte/compiler";
import { tokenize } from "../tokenizer";
import { parse } from "../parser";
import { generateStyles, transpileItems } from "../transform";
import { generateInjectedCode } from "../transform/generateInjectedCode";
import { getUniqueComponentIds } from "../transform/getComponentInstanceIds";
import { hash } from "../utils/hash";
import { ArgumentsType } from "vitest";
import { CssProcessorOtions } from "..";

export const processMarkup = async (
	opts: ArgumentsType<MarkupPreprocessor>[0],
	processorOptions: CssProcessorOtions
) => {
	// TODO: This pattern is very strict with formatting right now, and it still gets parsed if the css block is commented out.
	const cssBlockPattern = /\{css`([\s\S]*?)`\}/;
	const matchedString = opts.content.match(cssBlockPattern)?.[0];
	if (matchedString === undefined) return;

	let code = opts.content.replace(cssBlockPattern, "");

	const innerCss = matchedString?.match(cssBlockPattern)?.[1];
	if (innerCss === undefined) return;

	const tokens = tokenize(innerCss);
	const items = parse(tokens);
	const componentId = await hash(opts.filename ?? "");
	const componentInstanceIds = await getUniqueComponentIds(
		opts.filename ?? "",
		items
	);

	code = generateInjectedCode(componentId, componentInstanceIds, code);
	// const { staticStyle, dynamicStyle } = generateStyles(
	// 	componentId,
	// 	componentInstanceIds,
	// 	items
	// );
	const { staticStyle, dynamicStyle } = transpileItems(
		items,
		componentId,
		componentInstanceIds
	);

	code += staticStyle;
	code += dynamicStyle;

	if (processorOptions.printCode) console.log(code);

	return { code };
};
