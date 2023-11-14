import { Result, err, ok } from "outwrap";
import { AstItem } from "../ast";
import { parseSelectors } from "./parseSelector";
import { Parser } from "./parser";
import { parseBody } from "./parseBody";

export function parseRule(p: Parser): Result<AstItem, string> {
	const selectors = parseSelectors(p);

	if (selectors.isErr()) return selectors;

	const isOpenBracked = p.next().isExactChar("{");
	if (!isOpenBracked) err("Expected `{`");

	const body = parseBody(p);
	if (body.isErr()) return body;

	const isCloseBracket = p.next().isExactChar("}");
	if (!isCloseBracket) return err("Expected `}`");

	return ok({
		type: "rule",
		selectors: selectors.unwrap(),
		body: body.unwrap(),
	});
}
