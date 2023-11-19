import { test } from "vitest";
import { tokenize } from "../src/tokenizer";
import { parse } from "../src/parser";
import { generateStyles, transpileItems } from "../src/transform";

test("parse", () => {
	const tokens = tokenize(`
        div > div,
        .testing {
            width: 100%;
            color: \${Math.random() > 0.5 ? "red" : "yellow"};
            grid-template-columns: repeat(\${columns}, 1fr);
        }
        @media screen and (max-width: 1200px) {
            .bar {
                margin: 20px;
            }
        }
        @media screen and (max-width: \${dynamicWidth}) {
            .foo {
                padding: 16px;
                max-width: \${100}%;
            }
        }
    `);

	const result = parse(tokens);

	const { staticStyle, dynamicStyle } = transpileItems(
		result,
		"componentId",
		new Map()
	);

	console.log(staticStyle);
	console.log(dynamicStyle);
});
