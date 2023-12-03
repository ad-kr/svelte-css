import { test } from "vitest";
import { processCss } from "../src/preprocessor/processCss";
import { parse } from "css-tree";

test("processCss", async () => {
	const cssOld = `
        @media screen and (min-width: 400px) {
            body {
                color: blue;
            }
            :code(input) {
                color: :code(dynamicColor);
                width: 200px;
            }
            @media screen and (min-width: :code(400)px) {
                body {
                    color: :code(dynamicColor);
                    background: red;
                }
            }
        }
        input::placeholder div, :code(Flex).flexed:hover > div {
            color: red;
            background-color: :code("blue");
            width: :code(200 + 20 + \`\${"20"}\`)px;
        }
        @media screen and (min-width: :code(400)px) {
            body {
                color: :code(dynamicColor);
                background: red;
            }
            @media screen and (min-width: :code(400)px) {
                body {
                    color: :code(dynamicColor);
                    background: red;
                }
            }
        }
    `;

	const css = `
        a > \${Component}{
            color: \${colors[color]};
            /* border: \${getTextStyle(size, weight)}; */
            border: \${none()};
            css: \${s};
        }
        @media screen and (max-width: \${480}px) {
            div {
                width: 20px;
            }
        }
        @css \${customCss};
    `;

	const processed = await processCss(css, "filename");

	// TODO: Write actual test
});
