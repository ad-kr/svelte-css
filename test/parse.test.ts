import { test } from "vitest";
import { tokenize } from "../src/tokenizer";
import { parse } from "../src/parser";
import { generateStyles, transpileItems } from "../src/transform";
import { generateInjectedCode } from "../src/transform/generateInjectedCode";
import { getUniqueComponentIds } from "../src/transform/getComponentInstanceIds";

// Yep, this is ugly...
test("parse", async () => {
	// const tokens = tokenize(`
	//     div > div,
	//     .testing {
	//         width: 100%;
	//         color: \${Math.random() > 0.5 ? "red" : "yellow"};
	//         grid-template-columns: repeat(\${columns}, 1fr);
	//     }
	//     @media screen and (max-width: 1200px) {
	//         .bar {
	//             margin: 20px;
	//         }
	//     }
	//     @media screen and (max-width: \${dynamicWidth}) {
	//         .foo {
	//             padding: 16px;
	//             max-width: \${100}%;
	//         }
	//     }
	// `);
	const tokens = tokenize(`
        @media screen and (max-width: 700px) {
            \${Grid} {
                background: blue;
                grid-template-columns: repeat(3, 1fr);
            }
        }
    `);

	const result = parse(tokens);
	const componentInstanceIds = await getUniqueComponentIds(
		"filename.svelte",
		result
	);

    console.log(componentInstanceIds);

	const { staticStyle, dynamicStyle } = transpileItems(
		result,
		"componentId",
		componentInstanceIds
	);

	console.log(staticStyle);
	console.log(dynamicStyle);
});
