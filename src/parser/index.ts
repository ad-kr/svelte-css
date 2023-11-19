import { Result, err } from "outwrap";
import { AstItem } from "../ast";
import { Token } from "../tokenizer/tokens";
import { parseRule } from "./parseRule";
import { Parser } from "./parser";
import { parseKeyword } from "./parseKeyword";

/** Parsing of the css is actually quite dumb and simple in svelesheet. We're not actually creating a valid css AST, but rather only generating the parts that we need for further analysis. */
export function parse(tokens: Token[]): AstItem[] {
	const items: AstItem[] = [];

	const parser = new Parser(tokens);

	while (true) {
		const item = parseOuterScope(parser);

		if (item.isOk()) items.push(item.value);

		if (parser.isEmpty()) break;
	}

	return items;
}

export function parseOuterScope(parser: Parser): Result<AstItem, string> {
	parser.skipWhitespace();

	const peeked = parser.peek();

	if (peeked.isUndefined()) return err("Expected a css rule"); // TODO: Return error from outwrap

	if (peeked.isKeyword()) return parseKeyword(parser);

	return parseRule(parser);
}
