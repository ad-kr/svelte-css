import { Result, err } from "outwrap";
import { AstItem } from "../ast";
import { Token } from "../tokenizer/tokens";
import { parseRule } from "./parseRule";
import { Parser } from "./parser";

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

function parseOuterScope(parser: Parser): Result<AstItem, string> {
	parser.skipWhitespace();

	const peeked = parser.peek();

	if (peeked.isUndefined()) return err("Expected a css rule"); // TODO: Return error from outwrap

	return parseRule(parser);
}
