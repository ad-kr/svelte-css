import { test } from "vitest";
import { tokenize } from "../src/tokenizer";
import { Parser } from "../src/parser/parser";
import { parseKeyword } from "../src/parser/parseKeyword";

test("parseKeyword", () => {
	const tokens = tokenize(
		"@media screen and (max-width: 1200px) { .foo { color: red; } }"
	);

	const parser = new Parser(tokens);

	const result = parseKeyword(parser);

	console.log(result);
});
