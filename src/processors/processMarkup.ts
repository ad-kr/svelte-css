import { MarkupPreprocessor } from "svelte/compiler";
import { tokenize } from "../tokenizer";
import { parse } from "../parser";
import { generateStyles } from "../transform";
import { generateInjectedCode } from "../transform/generateInjectedCode";
import { getUniqueComponentIds } from "../transform/getComponentInstanceIds";
import { hash } from "../utils/hash";

export const processMarkup: MarkupPreprocessor = async (opts) => {
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
	const { staticStyle, dynamicStyle } = generateStyles(
		componentId,
		componentInstanceIds,
		items
	);

	code += staticStyle;
	code += dynamicStyle;

	return { code };
};
