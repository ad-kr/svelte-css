import { Result, err, ok } from "outwrap";
import { Parser } from "./parser";
import { Property, RuleBody } from "../ast";

export function parseBody(p: Parser): Result<RuleBody, string> {
	const properties: RuleBody = [];

	while (true) {
		p.skipWhitespace();
		const property = parseProperty(p);
		if (property.isErr()) return property;

		properties.push(property.unwrap());

        p.skipWhitespace();

		if (p.peek().isExactChar("}")) break;
	}

	return ok(properties);
}

function parseProperty(p: Parser): Result<Property, string> {
	let property = "";
	let type: Property["type"] = "static";

	while (true) {
		const next = p.next();

		if (next.isUndefined()) return err("Expected property");

		if (next.isCode()) type = "dynamic";

		property += next.toCssString();

		if (next.isExactChar(";")) break;
	}

	return ok({ type, property });
}
