import { test } from "vitest";
import { tokenize } from "../src/tokenizer";
import { parse } from "../src/parser";

test("parse", () => {
	const tokens = tokenize(`
        div > div,
        .testing {
            width: 100%;
            color: \${Math.random() > 0.5 ? "red" : "yellow"};
        }
    `);

	const result = parse(tokens);
});
