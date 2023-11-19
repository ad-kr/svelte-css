import { Result, err, ok } from "outwrap";
import { AstItem } from "../ast";
import { Parser } from "./parser";
import { parseOuterScope } from ".";

export function parseKeyword(
	p: Parser
): Result<Extract<AstItem, { type: "at-rule" }>, string> {
	if (p.peek().isUndefined()) return err("Expected a keyword");

	const query = parseKeywordQuery(p);

	if (query.isErr()) return query;

	const isOpenBracked = p.next().isExactChar("{");
	if (!isOpenBracked) return err("Expected `{`");

	const rules = parseKeywordRules(p);

	if (rules.isErr()) return rules;

	const isCloseBracket = p.next().isExactChar("}");
	if (!isCloseBracket) return err("Expected `}`");

	return ok({
		type: "at-rule",
		query: query.unwrap(),
		items: rules.unwrap(),
	});
}

function parseKeywordQuery(
	p: Parser
): Result<Extract<AstItem, { type: "at-rule" }>["query"], string> {
	let query = "";
	let isDynamic = false;

	while (true) {
		const peeked = p.peek();

		if (peeked.isUndefined()) return err("Expected query part");
		if (peeked.isExactChar("{")) break;
		if (peeked.isCode()) isDynamic = true;
		p.consume();

		query += peeked.toCssString();
	}

	return ok({ string: query, type: isDynamic ? "dynamic" : "static" });
}

function parseKeywordRules(p: Parser): Result<AstItem[], string> {
	const rules: AstItem[] = [];

	while (true) {
		const rule = parseOuterScope(p);

		if (rule.isErr()) return rule;

		rules.push(rule.unwrap());

		p.skipWhitespace();

		if (p.peek().isExactChar("}")) break;
	}

	return ok(rules);
}
