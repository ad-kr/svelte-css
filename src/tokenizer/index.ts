import { Keyword, Token, keywords } from "./tokens";
import { isChar } from "./utils";

export function tokenize(cssString: string): Token[] {
	const tokens: Token[] = [];
	const chars = cssString.split("");

	while (chars.length > 0) {
		const char = chars.shift();

		if (char === undefined) break;

		if (/\s/.test(char)) {
			while (true) {
				const peeked = chars[0];

				if (peeked === undefined) break;
				if (/\s/.test(peeked)) {
					chars.shift(); // Consume whitespace
					continue;
				}
				break;
			}
			tokens.push({ type: "space" });
			continue;
		}

		if (char === "$" && chars.at(0) === "{") {
			let code = "";
			chars.shift(); // Consume '{'

			while (true) {
				const next = chars.shift();

				if (next === "}") {
					tokens.push({ type: "code", code });
					break;
				}

				code += next;
			}

			continue;
		}

		if (char === '"' || char === "'") {
			const quoteStyle = char;
			let string = "";

			// TODO: Add string escaping
			while (true) {
				const next = chars.shift();

				if (next === quoteStyle) {
					tokens.push({ type: "string", string });
					break;
				}

				string += next;
			}
			continue;
		}

		if (isChar(char)) {
			tokens.push({ type: "char", char });
			continue;
		}

		let portion = char;
		while (true) {
			const peekedNextChar = chars[0];

			if (peekedNextChar === undefined) {
				// TODO: Return error, as this should never happen...
				break;
			}

			if (isChar(peekedNextChar) || /\s/.test(peekedNextChar) || peekedNextChar === "$") {
				break;
			}

			portion += peekedNextChar;
			chars.shift(); // Consume
		}

		if (isKeyword(portion)) {
			tokens.push({ type: "keyword", keyword: portion });
			continue;
		}

		tokens.push({ type: "portion", portion });
	}

	return tokens;
}

function isKeyword(portion: string): portion is Keyword {
	return keywords.includes(portion as Keyword);
}
