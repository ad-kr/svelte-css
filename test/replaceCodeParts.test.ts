import { expect, test } from "vitest";
import { replaceCodeParts } from "../src/preprocessor/replaceCodeParts";

test("replaceCodeParts", () => {
	const css = `
        body, \${Flex} {
            color: red;
            background-color: \${"blue"};
            width: \${200 + 20 + \`\${"20"}\`}px;
        }
        @media screen and (min-width: \${breakdpoints.small}px) {
            body {
                color: blue;
            }
        }
    `;

	const processedCss = replaceCodeParts(css);

	expect(processedCss).toBe(`
        body, :code(Flex) {
            color: red;
            background-color: :code("blue");
            width: :code(200 + 20 + \`\${"20"}\`)px;
        }
        @media screen and (min-width: :code(breakdpoints.small)px) {
            body {
                color: blue;
            }
        }
    `);
});
